import jwt
import json
import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-this-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data/users.json")

class AuthService:
    def __init__(self):
        self._ensure_users_file()

    def _ensure_users_file(self):
        """Ensures the users JSON file exists."""
        if not os.path.exists(USERS_FILE):
            os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
            with open(USERS_FILE, 'w') as f:
                json.dump({}, f)

    def _load_users(self):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)

    def _save_users(self, users):
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=4)

    def get_user(self, username: str):
        users = self._load_users()
        return users.get(username)

    def create_user(self, username, email, password):
        users = self._load_users()
        if username in users:
            return False, "Username already exists"
        
        # Check if email exists (simple check)
        for user in users.values():
            if user.get("email") == email:
                return False, "Email already registered"

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        users[username] = {
            "username": username,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.utcnow().isoformat()
        }
        
        self._save_users(users)
        return True, "User created successfully"

    def authenticate_user(self, username, password):
        user = self.get_user(username)
        if not user:
            return False
        
        if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return user
        return False

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
