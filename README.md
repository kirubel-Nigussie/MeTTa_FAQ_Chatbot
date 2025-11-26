# MeTTa FAQ Chatbot

A chatbot for the MeTTa programming language. This project combines a **FastAPI** backend (with Hyperon/MeTTa integration) and a **Next.js** frontend to answer user questions based on a structured knowledge base.

## Project Structure

### Backend (`/backend`)
Built with Python and FastAPI.
- **`src/app.py`**: Main entry point. Defines API endpoints (`/api/chat`, `/api/auth/*`).
- **`src/metta_service.py`**: Handles interaction with the MeTTa knowledge base (`knowledge.metta`). Loads atoms and searches for concepts.
- **`src/llm_service.py`**: Manages communication with Google's Gemini API. Parses user queries into concepts and generates natural language responses.
- **`src/auth_service.py`**: Handles user authentication (Signup/Login) and JWT token generation.
- **`data/knowledge.metta`**: The core knowledge base containing MeTTa concepts, types, and functions.
- **`data/users.json`**: Simple file-based storage for user credentials (created automatically).

### Frontend (`/frontend`)
Built with Next.js and Tailwind CSS.
- **`src/app/page.js`**: The main chat interface. Handles message display and user input.
- **`src/app/login/page.js`**: User login page.
- **`src/app/signup/page.js`**: User registration page.
- **`src/contexts/AuthContext.js`**: Manages global authentication state (login/logout/token).
- **`src/app/constants.js`**: Configuration file for API URLs.

## Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **Google Gemini API Key**

## Setup & Running

### 1. Backend Setup
Navigate to the backend folder:
```bash
cd backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` with your API key:
```
GEMINI_API_KEY=your_actual_api_key_here
JWT_SECRET_KEY=your_secret_key_here
```

Run the server:
```bash
python src/app.py
```
The backend will start at `http://localhost:8000`.

### 2. Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
The frontend will start at `http://localhost:3000`.

## Usage
1.  Open `http://localhost:3000` in your browser.
2.  You will be redirected to the **Login** page.
3.  Click "Sign up here" to create a new account.
4.  Once logged in, ask questions like:
    - "What is an Atom?"
    - "How does the match function work?"
    - "Explain the concept of Variable."
5.  The bot will retrieve specific information from the MeTTa knowledge base and explain it to you.
