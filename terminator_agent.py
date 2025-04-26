import platform
import subprocess
import time
import logging
import os
import random
import re # <-- Import re for code detection
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pyautogui
import pygetwindow as gw # <-- Import pygetwindow
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
# Use os.path.expandvars to handle environment variables like %USERNAME%, %LOCALAPPDATA%, %ProgramFiles%
# Ensure paths are correct for your system. These are common defaults.
# Using os.path.expandvars makes it automatically use the current user's paths.
APP_MAP = {
    # Common system apps
    "notepad": "notepad.exe",
    "calc": "calc.exe",
    "calculator": "calc.exe",
    "explorer": "explorer.exe",
    "cmd": "cmd.exe",
    "powershell": "powershell.exe",

    # Browsers
    "chrome": os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
    "firefox": os.path.expandvars(r"%ProgramFiles%\Mozilla Firefox\firefox.exe"),
    "edge": os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),

    # Development Tools
    "vscode": os.path.expandvars(r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"),

    # Microsoft Office (Common paths, might vary based on installation type/version)
    "word": os.path.expandvars(r"%ProgramFiles%\Microsoft Office\root\Office16\WINWORD.EXE"),
    "excel": os.path.expandvars(r"%ProgramFiles%\Microsoft Office\root\Office16\EXCEL.EXE"),
    "powerpoint": os.path.expandvars(r"%ProgramFiles%\Microsoft Office\root\Office16\POWERPNT.EXE"),

    # Communication
    "whatsapp": os.path.expandvars(r"%LOCALAPPDATA%\WhatsApp\WhatsApp.exe"),
    "slack": os.path.expandvars(r"%LOCALAPPDATA%\slack\slack.exe"),
    "teams": os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Teams\current\Teams.exe"),

    # Add more common apps as needed (ensure paths are tested on your system)
}

# --- Window Title Mapping for Activation ---
# Use partial titles for better matching flexibility
WINDOW_TITLE_MAP = {
    "notepad": "Notepad",
    "chrome": "Google Chrome",
    "firefox": "Mozilla Firefox",
    "edge": "Microsoft Edge",
    "vscode": "Visual Studio Code",
    "word": "Word",
    "excel": "Excel",
    "powerpoint": "PowerPoint",
    "whatsapp": "WhatsApp",
    "slack": "Slack",
    "teams": "Microsoft Teams",
    "calc": "Calculator",
    "calculator": "Calculator",
    # Add more as needed
}

# --- FastAPI Setup ---
app = FastAPI(
    title="Terminator Agent",
    description="A local agent to control Windows applications via API calls.",
    version="0.1.4" # <-- Version bump
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
    action: str | None = Field(None, description="Text/URL to type or command-specific parameter.")

# --- Helper Function: Check if text looks like code ---
def looks_like_code(text):
    # Simple check for common code keywords/patterns
    patterns = [
        r'\b(def|class|import|function|const|let|var|public|private|static|void|int|string|bool)\b',
        r'[{};()=/>]', # Common symbols
        r'^(# |//|''')' # Starts with comment
    ]
    # Check if multiple patterns match to increase confidence
    matches = sum(1 for pattern in patterns if re.search(pattern, text, re.MULTILINE))
    return matches >= 2 # Adjust threshold as needed

# --- API Endpoint ---
@app.post("/execute", summary="Execute an application control command")
async def execute_action(command: ExecuteCommand):
    """
    Opens a specified application and optionally types text into it or performs a special action.

    Looks up common application names in an internal map for full paths.
    Falls back to using the provided name directly if not found in the map.
    Attempts to activate the application window before typing.
    Can launch Chrome directly with a URL.
    Can attempt to auto-save code typed into Notepad.

    - **app**: Alias or executable name (e.g., 'notepad', 'chrome', 'calc.exe').
    - **action**: Optional text/URL to type or command-specific parameter.
    """
    app_alias = command.app.lower()
    action_text = command.action
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Log request (truncate long actions)
    action_log_display = (action_text[:50] + '...' if action_text and len(action_text) > 50 else action_text)
    log_message = f"Request received: app='{command.app}' (alias='{app_alias}'), action='{action_log_display}'"
    logging.info(log_message)
    print(f"{timestamp} - {log_message}")

    # 1. Determine execution path/command & target window title
    app_to_execute = APP_MAP.get(app_alias)
    chrome_path = APP_MAP.get("chrome")
    target_window_title = WINDOW_TITLE_MAP.get(app_alias)

    if app_to_execute:
        print(f"Mapped alias '{app_alias}' to '{app_to_execute}'")
        if not os.path.exists(app_to_execute):
            warning_msg = f"Warning: Mapped path for '{app_alias}' ('{app_to_execute}') does not exist. Trying alias directly."
            logging.warning(warning_msg)
            print(f"{timestamp} - {warning_msg}")
            app_to_execute = command.app # Fallback to original input
    else:
        warning_msg = f"Warning: Alias '{app_alias}' not found in APP_MAP. Trying the name directly."
        logging.warning(warning_msg)
        print(f"{timestamp} - {warning_msg}")
        app_to_execute = command.app

    # --- Special Handling for Chrome URL --- 
    is_chrome_url_launch = False
    if app_alias == "chrome" and action_text and action_text.startswith(("http://", "https://")):
        if chrome_path and os.path.exists(chrome_path):
            app_to_execute = [chrome_path, action_text] # Command becomes list [app_path, url]
            is_chrome_url_launch = True
            print(f"Detected Chrome URL launch. Will execute: {app_to_execute}")
        else:
            print(f"Warning: Chrome path not found ('{chrome_path}'). Falling back to typing URL.")

    try:
        # 2. Open the application
        print(f"Attempting to execute: {app_to_execute}")
        process = subprocess.Popen(app_to_execute) # Popen handles list or string
        print(f"Process started with PID: {process.pid}")

        # 3. Perform action (typing) IF NOT handled differently
        log_message_action = f"Action performed: Opened '{command.app}' (executed as '{str(app_to_execute)[:50]}...')"

        if action_text and not is_chrome_url_launch:
            # --- Intelligent Wait & Focus --- 
            wait_time = 3.5 if app_alias in ["vscode", "word", "excel", "powerpoint"] else 2.5
            print(f"Waiting {wait_time:.1f} seconds for app focus...")
            time.sleep(wait_time)
            activated = False
            if target_window_title:
                try:
                    print(f"Attempting to find and activate window with title containing: '{target_window_title}'")
                    windows = gw.getWindowsWithTitle(target_window_title)
                    if windows:
                        target_window = windows[0]
                        if not target_window.isActive:
                             target_window.activate()
                             print(f"Activated window: {target_window.title}")
                             time.sleep(0.5)
                        else:
                             print(f"Window '{target_window.title}' already active.")
                        activated = True
                    else:
                        print(f"No window found with title containing '{target_window_title}'.")
                except Exception as focus_error:
                    print(f"Error activating window '{target_window_title}': {focus_error}. Falling back to Alt+Tab.")
            else:
                 print("No target window title mapped. Skipping direct activation.")
            
            if not activated:
                print("Activating via Alt+Tab fallback...")
                pyautogui.hotkey('alt', 'tab')
                time.sleep(0.7)
            # --------------------------------

            print(f"Attempting to type: '{action_text[:50]}...'" ) # Log truncated action
            try:
                interval = random.uniform(0.03, 0.07)
                pyautogui.write(action_text, interval=interval)
                print(f"Typing complete (interval: {interval:.3f}s).")
                log_message_action = f"Action performed: Typed '{action_text[:50]}...' into '{command.app}' (executed as '{str(app_to_execute)[:50]}...')"

                # --- Auto-Save Logic for Notepad Code ---
                if app_alias == "notepad" and looks_like_code(action_text):
                    print("Detected code in Notepad, attempting auto-save...")
                    try:
                        pyautogui.hotkey('ctrl', 's')
                        time.sleep(1.2) # Wait for Save As dialog
                        filename = "generated_code.txt"
                        print(f"Typing filename: {filename}")
                        pyautogui.write(filename)
                        time.sleep(0.5)
                        pyautogui.press('enter')
                        print("Auto-save sequence completed.")
                        log_message_action += f" and attempted auto-save as '{filename}'"
                    except Exception as save_error:
                        print(f"Error during auto-save attempt: {save_error}")
                        log_message_action += " but auto-save failed."
                # -------------------------------------------

            except Exception as pgui_error:
                 error_msg = f"Error during typing action: {str(pgui_error)}"
                 logging.error(error_msg)
                 print(f"{timestamp} - {error_msg}")
                 log_message_action = f"Action performed: Opened '{command.app}', but failed to type: {str(pgui_error)}"

        # Log final action message
        logging.info(log_message_action)
        print(f"{timestamp} - {log_message_action}")

        return {"status": "success", "message": log_message_action}

    except FileNotFoundError:
        error_msg = f"Error: Command/Application '{str(app_to_execute)}' not found. Ensure it's in PATH or mapped correctly."
        logging.error(error_msg)
        print(f"{timestamp} - {error_msg}")
        raise HTTPException(status_code=404, detail=error_msg)
    except Exception as e:
        error_msg = f"An unexpected error occurred while trying to execute '{str(app_to_execute)}': {str(e)}"
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