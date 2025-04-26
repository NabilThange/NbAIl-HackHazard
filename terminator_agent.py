import platform
import subprocess
import time
import logging
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pyautogui
# --- Add CORS --- 
from fastapi.middleware.cors import CORSMiddleware

# --- Platform Check ---
if platform.system() != "Windows":
    print("Error: This script is designed to run only on Windows.")
    exit()

# --- Logging Setup ---
logging.basicConfig(
    filename='terminator_log.txt',
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# --- Application Path Mapping (Windows Only) ---
# Use os.path.expandvars to handle environment variables like %USERNAME% or %ProgramFiles%
# Ensure paths are correct for your system. These are common defaults.
APP_MAP = {
    "notepad": "notepad.exe",
    "calc": "calc.exe", # Calculator is usually in PATH
    "calculator": "calc.exe",
    "chrome": os.path.expandvars("%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"),
    "firefox": os.path.expandvars("%ProgramFiles%\\Mozilla Firefox\\firefox.exe"),
    "edge": os.path.expandvars("%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"),
    "vscode": os.path.expandvars("%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\Code.exe"),
    "word": os.path.expandvars("%ProgramFiles%\\Microsoft Office\\root\\Office16\\WINWORD.EXE"),
    "excel": os.path.expandvars("%ProgramFiles%\\Microsoft Office\\root\\Office16\\EXCEL.EXE"),
    "powerpoint": os.path.expandvars("%ProgramFiles%\\Microsoft Office\\root\\Office16\\POWERPNT.EXE"),
    # Add more common apps as needed
}

# --- FastAPI Setup ---
app = FastAPI(
    title="Terminator Agent",
    description="A local agent to control Windows applications via API calls.",
    version="0.1.1"
)

# --- Add CORS Middleware ---
# Allow requests from any origin during development. 
# For production, you might want to restrict this to your Vercel app's URL.
origins = [
    "*", # Allows all origins
    # Example for restricting to Vercel:
    # "https://your-app-name.vercel.app", 
    # "http://localhost:3000", # Allow local frontend dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"], # Allow POST for /execute, GET for /
    allow_headers=["*"],
)
# ------------------------

# --- Request Model ---
class ExecuteCommand(BaseModel):
    app: str = Field(..., description="The name or alias of the application (e.g., 'notepad', 'chrome')")
    action: str | None = Field(None, description="Text to type into the application after opening.")

# --- API Endpoint ---
@app.post("/execute", summary="Execute an application control command")
async def execute_action(command: ExecuteCommand):
    """
    Opens a specified application and optionally types text into it.

    Looks up common application names in an internal map for full paths.
    Falls back to using the provided name directly if not found in the map.
    
    - **app**: Alias or executable name (e.g., 'notepad', 'chrome', 'calc.exe').
    - **action**: Optional text to type.
    """
    app_alias = command.app.lower() # Use lowercase for map lookup
    action_text = command.action
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_message = f"Request received: app='{command.app}' (alias='{app_alias}'), action='{action_text}'"
    logging.info(log_message)
    print(f"{timestamp} - {log_message}")

    # 1. Determine the actual application path/command
    app_to_execute = APP_MAP.get(app_alias)
    if app_to_execute:
        print(f"Mapped alias '{app_alias}' to '{app_to_execute}'")
        # Check if the mapped path actually exists
        if not os.path.exists(app_to_execute):
             warning_msg = f"Warning: Mapped path for '{app_alias}' ('{app_to_execute}') does not exist. Trying alias directly."
             logging.warning(warning_msg)
             print(f"{timestamp} - {warning_msg}")
             app_to_execute = command.app # Fallback to original input if mapped path invalid
    else:
        warning_msg = f"Warning: Alias '{app_alias}' not found in APP_MAP. Trying the name directly."
        logging.warning(warning_msg)
        print(f"{timestamp} - {warning_msg}")
        app_to_execute = command.app # Use the original input name if not in map

    try:
        # 2. Open the application using the determined path/command
        print(f"Attempting to execute '{app_to_execute}'...")
        process = subprocess.Popen(app_to_execute) 
        print(f"'{app_to_execute}' opened with PID: {process.pid}")

        # 3. Perform action if specified
        if action_text:
            wait_time = 2 
            print(f"Waiting {wait_time} seconds before typing...")
            time.sleep(wait_time)

            print(f"Typing into the application: '{action_text}'")
            pyautogui.write(action_text, interval=0.05)
            print("Typing complete.")
            log_message_action = f"Action performed: Typed '{action_text}' into '{command.app}' (executed as '{app_to_execute}')"
        else:
            log_message_action = f"Action performed: Opened '{command.app}' (executed as '{app_to_execute}')"

        logging.info(log_message_action)
        print(f"{timestamp} - {log_message_action}")

        return {"status": "success", "message": log_message_action}

    except FileNotFoundError:
        error_msg = f"Error: Command/Application '{app_to_execute}' not found. Ensure it's in PATH or mapped correctly."
        logging.error(error_msg)
        print(f"{timestamp} - {error_msg}")
        raise HTTPException(status_code=404, detail=error_msg)
    except Exception as e:
        error_msg = f"An unexpected error occurred while trying to execute '{app_to_execute}': {str(e)}"
        logging.error(error_msg)
        print(f"{timestamp} - {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

# --- Health Check Endpoint ---
@app.get("/", summary="Health check")
async def root():
    """Basic health check endpoint."""
    return {"message": "Terminator Agent is running."}

# --- Main Execution Block ---
if __name__ == "__main__":
    import uvicorn
    print("Starting Terminator Agent on http://127.0.0.1:8000")
    print("Ensure this terminal remains open.")
    print("Logs will be written to terminator_log.txt")
    uvicorn.run(app, host="127.0.0.1", port=8000) 