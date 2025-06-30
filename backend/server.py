from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import uuid
from datetime import datetime
import socketio
import subprocess
import psutil
import platform
import json
import asyncio
import shlex

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asgi')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Socket.IO app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Active terminal sessions
active_sessions = {}

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class CommandRequest(BaseModel):
    command: str
    session_id: str
    working_directory: str = "."

class AIRequest(BaseModel):
    message: str
    context: str = ""
    api_key: str
    provider: str = "openai"

def get_shell_command():
    """Get the appropriate shell command based on the operating system"""
    system = platform.system().lower()
    if system == "windows":
        return ["powershell.exe", "-Command"]
    else:
        return ["/bin/bash", "-c"]

def format_command_for_shell(command: str) -> str:
    """Format command for the appropriate shell"""
    system = platform.system().lower()
    if system == "windows":
        # For PowerShell, we need to handle commands properly
        return command
    else:
        return command

async def execute_command(command: str, working_dir: str = ".") -> Dict[str, Any]:
    """Execute a command and return the result"""
    try:
        # Change to the working directory
        original_dir = os.getcwd()
        if working_dir != "." and os.path.exists(working_dir):
            os.chdir(working_dir)
        
        # Get shell command
        shell_cmd = get_shell_command()
        formatted_cmd = format_command_for_shell(command)
        
        # Execute the command
        if platform.system().lower() == "windows":
            process = await asyncio.create_subprocess_exec(
                *shell_cmd, formatted_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=working_dir
            )
        else:
            process = await asyncio.create_subprocess_shell(
                formatted_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=working_dir
            )
        
        stdout, stderr = await process.communicate()
        
        # Restore original directory
        os.chdir(original_dir)
        
        return {
            "success": process.returncode == 0,
            "stdout": stdout.decode('utf-8', errors='ignore') if stdout else "",
            "stderr": stderr.decode('utf-8', errors='ignore') if stderr else "",
            "return_code": process.returncode,
            "working_directory": working_dir
        }
    
    except Exception as e:
        os.chdir(original_dir)
        return {
            "success": False,
            "stdout": "",
            "stderr": str(e),
            "return_code": -1,
            "working_directory": working_dir
        }

async def analyze_with_ai(message: str, context: str, api_key: str, provider: str) -> str:
    """Analyze command output with AI"""
    if not api_key:
        return "AI analysis requires an API key. Please configure your API key in settings."
    
    # Mock AI response for now - in production, integrate with actual AI APIs
    ai_responses = {
        "error": "I see there's an error in the command execution. Let me help you troubleshoot this issue.",
        "git": "This appears to be a Git command. I can help you with Git operations and version control.",
        "npm": "This is an npm command for Node.js package management. I can assist with package operations.",
        "ls": "This is a directory listing command. I can help you navigate and understand your file system.",
        "cd": "This is a change directory command. I can help you navigate your file system efficiently.",
        "python": "This is a Python command. I can help you with Python development and troubleshooting.",
        "docker": "This is a Docker command. I can assist with containerization and Docker operations."
    }
    
    message_lower = message.lower()
    for key, response in ai_responses.items():
        if key in message_lower:
            return f"{response}\n\nContext: {context[:200]}..."
    
    return f"I'm analyzing your command: '{message}'. Based on the context, I can provide suggestions and help troubleshoot any issues. Please make sure your API key is properly configured for detailed AI assistance."

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    active_sessions[sid] = {
        "working_directory": os.getcwd() if platform.system() != "Windows" else "C:\\",
        "history": [],
        "session_id": str(uuid.uuid4())
    }

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    if sid in active_sessions:
        del active_sessions[sid]

@sio.event
async def execute_command_event(sid, data):
    """Handle command execution via Socket.IO"""
    try:
        command = data.get('command', '')
        working_dir = active_sessions.get(sid, {}).get('working_directory', '.')
        
        # Execute the command
        result = await execute_command(command, working_dir)
        
        # Update working directory if command was 'cd'
        if command.strip().startswith('cd ') and result['success']:
            new_dir = command.strip()[3:].strip()
            if new_dir == '..':
                new_dir = os.path.dirname(working_dir)
            elif not os.path.isabs(new_dir):
                new_dir = os.path.join(working_dir, new_dir)
            
            if os.path.exists(new_dir):
                active_sessions[sid]['working_directory'] = os.path.abspath(new_dir)
                result['working_directory'] = active_sessions[sid]['working_directory']
        
        # Add to history
        active_sessions[sid]['history'].append({
            'command': command,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
        # Send result back to client
        await sio.emit('command_result', {
            'command': command,
            'result': result,
            'session_id': active_sessions[sid]['session_id']
        }, to=sid)
        
    except Exception as e:
        await sio.emit('command_error', {
            'error': str(e),
            'command': data.get('command', '')
        }, to=sid)

@sio.event
async def ai_analyze(sid, data):
    """Handle AI analysis requests"""
    try:
        message = data.get('message', '')
        context = data.get('context', '')
        api_key = data.get('api_key', '')
        provider = data.get('provider', 'openai')
        
        analysis = await analyze_with_ai(message, context, api_key, provider)
        
        await sio.emit('ai_response', {
            'message': message,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        }, to=sid)
        
    except Exception as e:
        await sio.emit('ai_error', {
            'error': str(e),
            'message': data.get('message', '')
        }, to=sid)

@sio.event
async def get_system_info(sid, data):
    """Get system information"""
    try:
        system_info = {
            'platform': platform.system(),
            'platform_version': platform.version(),
            'platform_release': platform.release(),
            'architecture': platform.architecture()[0],
            'processor': platform.processor(),
            'hostname': platform.node(),
            'current_directory': active_sessions.get(sid, {}).get('working_directory', os.getcwd()),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'memory_available': psutil.virtual_memory().available
        }
        
        await sio.emit('system_info', system_info, to=sid)
        
    except Exception as e:
        await sio.emit('system_error', {'error': str(e)}, to=sid)

# REST API routes
@api_router.get("/")
async def root():
    return {"message": "Advanced Terminal with AI - Backend Server"}

@api_router.post("/execute")
async def execute_command_api(request: CommandRequest):
    """Execute command via REST API"""
    result = await execute_command(request.command, request.working_directory)
    return result

@api_router.post("/ai/analyze")
async def ai_analyze_api(request: AIRequest):
    """Analyze with AI via REST API"""
    analysis = await analyze_with_ai(request.message, request.context, request.api_key, request.provider)
    return {"analysis": analysis}

@api_router.get("/system/info")
async def get_system_info_api():
    """Get system information via REST API"""
    return {
        'platform': platform.system(),
        'platform_version': platform.version(),
        'platform_release': platform.release(),
        'architecture': platform.architecture()[0],
        'processor': platform.processor(),
        'hostname': platform.node(),
        'python_version': platform.python_version(),
        'cpu_count': psutil.cpu_count(),
        'memory_total': psutil.virtual_memory().total,
        'memory_available': psutil.virtual_memory().available
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Mount Socket.IO
app.mount("/socket.io", socket_app)