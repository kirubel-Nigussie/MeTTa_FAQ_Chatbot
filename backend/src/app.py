from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from metta_service import MettaService
from llm_service import LLMService
from auth_service import AuthService

# Load environment variables
load_dotenv()

app = FastAPI(title="MeTTa FAQ Chatbot API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Path to data/knowledge.metta relative to src/
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "../data/knowledge.metta"))

try:
    metta_service = MettaService(DATA_PATH)
    llm_service = LLMService()
    auth_service = AuthService()
except Exception as e:
    print(f"Error initializing services: {e}")

# Auth Models
class UserSignup(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    message: str

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = auth_service.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload.get("sub")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "MeTTa FAQ API is running"}

# --- Auth Endpoints ---

@app.post("/api/auth/signup")
async def signup(user: UserSignup):
    success, message = auth_service.create_user(user.username, user.email, user.password)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    # Auto-login after signup
    token = auth_service.create_access_token(data={"sub": user.username})
    return {
        "status": "success",
        "message": "User created successfully",
        "token": token,
        "user": {"username": user.username, "email": user.email}
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    authenticated_user = auth_service.authenticate_user(user.username, user.password)
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = auth_service.create_access_token(data={"sub": user.username})
    return {
        "status": "success",
        "token": token,
        "user": {"username": authenticated_user["username"], "email": authenticated_user["email"]}
    }

# --- Chat Endpoint (Protected) ---

@app.post("/api/chat")
async def chat(request: ChatRequest, current_user: str = Depends(get_current_user)):
    user_message = request.message
    
    # 1. Parse User Intent
    print(f"Debug: Received chat message from {current_user}: {user_message}")
    parsed = llm_service.parse_query(user_message)
    print(f"Debug: Parsed intent: {parsed}")
    concept = parsed.get("concept")
    
    if not concept:
        # Fallback or generic chat
        print("Debug: No concept identified.")
        return {
            "response": "I couldn't identify a specific MeTTa concept in your question. Try asking about 'Atom', 'match', or 'unify'.",
            "sources": None
        }

    # 2. Retrieve Data from MeTTa
    print(f"Debug: Retrieving data for concept: {concept}")
    data = metta_service.search_concept(concept)
    print(f"Debug: Retrieved data: {data}")
    
    # 3. Generate Answer
    answer = llm_service.generate_response(user_message, data)
    print(f"Debug: Generated answer: {answer}")
    
    return {
        "response": answer,
        "sources": data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
