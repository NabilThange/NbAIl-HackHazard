import platform
import subprocess
import time
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pyautogui

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

# --- FastAPI Setup ---
app = FastAPI(
    title="Terminator Agent",
    description="A local agent to control Windows applications via API calls.",
    version="0.1.0"
)

# --- Request Model ---
class ExecuteCommand(BaseModel):
    app: str = Field(..., description="The name of the application executable (e.g., 'notepad', 'calc', 'chrome')")
    action: str | None = Field(None, description="Text to type into the application after opening.")

# --- API Endpoint ---
@app.post("/execute", summary="Execute an application control command")
async def execute_action(command: ExecuteCommand):
    """
    Opens a specified application and optionally types text into it.

    - **app**: Name of the application to open (e.g., 'notepad.exe', 'calc.exe').
               Uses subprocess.Popen, so ensure the app is in PATH or provide the full path.
    - **action**: Optional text to type into the application using pyautogui.
                  Waits 2 seconds after opening the app before typing.
    """
    app_name = command.app
    action_text = command.action
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_message = f"Request received: app='{app_name}', action='{action_text}'"
    logging.info(log_message)
    print(f"{timestamp} - {log_message}") # Also print to console for visibility

    try:
        # 1. Open the application
        print(f"Attempting to open '{app_name}'...")
        process = subprocess.Popen(app_name) # Use Popen for non-blocking execution
        print(f"'{app_name}' opened with PID: {process.pid}")

        # 2. Perform action if specified
        if action_text:
            # Wait for the app to likely become active
            # Note: This is a simple delay. More robust solutions might involve
            # checking for window focus, but pyautogui doesn't directly support
            # finding windows by process name easily.
            wait_time = 2 # seconds
            print(f"Waiting {wait_time} seconds before typing...")
            time.sleep(wait_time)

            print(f"Typing into the application: '{action_text}'")
            pyautogui.write(action_text, interval=0.05) # Add a small interval between keys
            print("Typing complete.")
            log_message_action = f"Action performed: Typed '{action_text}' into '{app_name}'"
        else:
            log_message_action = f"Action performed: Opened '{app_name}'"

        logging.info(log_message_action)
        print(f"{timestamp} - {log_message_action}")

        return {"status": "success", "message": log_message_action}

    except FileNotFoundError:
        error_msg = f"Error: Application '{app_name}' not found. Make sure it's in PATH or provide the full path."
        logging.error(error_msg)
        print(f"{timestamp} - {error_msg}")
        raise HTTPException(status_code=404, detail=error_msg)
    except Exception as e:
        error_msg = f"An unexpected error occurred: {str(e)}"
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