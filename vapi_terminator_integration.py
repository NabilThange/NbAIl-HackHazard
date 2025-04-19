import json
import sys
import webbrowser # Using webbrowser as a fallback/alternative for simple URL opening
from time import sleep

# Attempt to import the Terminator client library
# Make sure you have installed it: pip install desktop-use
try:
    from desktop_use import DesktopUseClient, ApiError
    # Initialize the client (assumes Terminator server is running on 127.0.0.1:3000)
    terminator_client = DesktopUseClient()
    TERMINATOR_AVAILABLE = True
    print("Terminator client initialized successfully.")
except ImportError:
    print("Warning: desktop-use library not found. Terminator actions will be skipped.")
    print("Install it using: pip install desktop-use")
    TERMINATOR_AVAILABLE = False
    terminator_client = None
except Exception as e:
    print(f"Warning: Could not connect to Terminator server: {e}")
    print("Make sure the Terminator server application is running.")
    TERMINATOR_AVAILABLE = False
    terminator_client = None

# --- Terminator Action Functions ---

def open_application_terminator(app_name):
    """Uses Terminator to open an application by its name."""
    if not TERMINATOR_AVAILABLE:
        print(f"Skipping Terminator action: Open application '{app_name}'")
        return False

    print(f"Attempting to open application: '{app_name}' using Terminator...")
    try:
        # Note: The 'app_name' might need to be the executable name (e.g., 'calc', 'notepad')
        # or a more specific path depending on the application and OS.
        terminator_client.open_application(app_name)
        print(f"Successfully requested Terminator to open '{app_name}'.")
        return True
    except ApiError as e:
        print(f"Terminator API Error opening application '{app_name}': {e}")
        return False
    except Exception as e:
        print(f"Unexpected error opening application '{app_name}' with Terminator: {e}")
        return False

def open_url_terminator(url):
    """Uses Terminator to open a URL in the default browser."""
    if not TERMINATOR_AVAILABLE:
        print(f"Skipping Terminator action: Open URL '{url}'")
        # Fallback to Python's built-in webbrowser
        try:
            print(f"Falling back to system browser for URL: {url}")
            webbrowser.open(url)
            return True
        except Exception as e:
            print(f"Error opening URL with system browser: {e}")
            return False

    print(f"Attempting to open URL: '{url}' using Terminator...")
    try:
        terminator_client.open_url(url)
        print(f"Successfully requested Terminator to open URL '{url}'.")
        return True
    except ApiError as e:
        print(f"Terminator API Error opening URL '{url}': {e}")
        return False
    except Exception as e:
        print(f"Unexpected error opening URL '{url}' with Terminator: {e}")
        return False

def search_web_terminator(query):
    """Opens the default browser and searches Google for the query using Terminator."""
    # Construct Google search URL
    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
    return open_url_terminator(search_url)

def type_text_terminator(text_to_type):
    """
    Uses Terminator to type text into the currently focused element.
    NOTE: This is highly context-dependent and likely requires element targeting.
    This basic version attempts to type globally, which might not work as intended.
    A robust implementation needs element locators.
    """
    if not TERMINATOR_AVAILABLE:
        print(f"Skipping Terminator action: Type text '{text_to_type}'")
        return False

    print(f"Attempting to type text: '{text_to_type}' using Terminator...")
    print("Warning: Global typing is unreliable. Target a specific element for robust typing.")
    try:
        # This is a simplified approach. Ideally, you locate an element first.
        # Example: window = terminator_client.locator('window:Your Window Title')
        # Example: input_field = window.locator('role:Edit') # Find the right locator
        # Example: input_field.type_text(text_to_type)

        # Placeholder for global typing attempt (might not work reliably)
        # For now, we'll just print a message as global typing isn't directly exposed
        # in the basic examples found. You'd typically need to locate an element first.
        print(f"Action required: Manually focus the desired input field before typing '{text_to_type}'.")
        print("(Advanced implementation needed using Terminator locators for reliable typing)")
        # To make this actually type, you would need something like:
        # focused_element = terminator_client.get_focused_element() # Hypothetical function
        # focused_element.type_text(text_to_type)
        # OR target a specific known element as shown above.
        return False # Return False as this basic version doesn't perform the action reliably

    except ApiError as e:
        print(f"Terminator API Error typing text: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error typing text with Terminator: {e}")
        return False

# --- VAPI Data Processing Logic ---

def process_vapi_data(vapi_json_data):
    """
    Parses the structured data from VAPI and decides which Terminator action to trigger.
    Args:
        vapi_json_data (dict): A dictionary representing the JSON data received from VAPI.
                               Expected structure:
                               {
                                 "summary": "User wants to...",
                                 "structuredData": {
                                   "appName": "AppNameOrNull",
                                   "searchQuery": "SearchTermOrUrlOrNull"
                                 }
                               }
    """
    print("\nProcessing VAPI data...")
    if not isinstance(vapi_json_data, dict):
        print("Error: Input data is not a valid dictionary.")
        return

    structured_data = vapi_json_data.get("structuredData")
    summary = vapi_json_data.get("summary", "No summary provided.")
    print(f"Received Summary: {summary}")

    if not isinstance(structured_data, dict):
        print("Error: 'structuredData' field is missing or not a dictionary.")
        return

    app_name = structured_data.get("appName")
    search_query = structured_data.get("searchQuery")

    print(f"Parsed - appName: {app_name}, searchQuery: {search_query}")

    # --- Action Logic ---
    action_taken = False
    if app_name and not search_query:
        # Action: Open Application
        print(f"Action: Open application '{app_name}'")
        action_taken = open_application_terminator(app_name)

    elif search_query:
        # Action: Search or Open URL or Type
        # Simple check if it looks like a URL
        if search_query.startswith("http://") or search_query.startswith("https://") or "." in search_query.split(" ")[0]:
            # Looks like a URL or domain - try opening directly
            print(f"Action: Open URL '{search_query}'")
            action_taken = open_url_terminator(search_query)
        elif "type" in summary.lower() or "write" in summary.lower():
            # If the summary suggests typing, try typing the query
            # This is a basic heuristic and might need refinement
            print(f"Action: Type text '{search_query}'")
            action_taken = type_text_terminator(search_query)
            if not action_taken:
                 print("Typing failed or not implemented reliably. Consider focusing the target manually.")
        else:
            # Default to web search
            print(f"Action: Search web for '{search_query}'")
            action_taken = search_web_terminator(search_query)

    else:
        print("No specific action identified from structuredData.")

    if not action_taken and (app_name or search_query):
        print("Warning: An action was identified but could not be executed successfully (Terminator might be unavailable or an error occurred).")
    elif action_taken:
        print("Action executed successfully.")


# --- Example Usage ---

if __name__ == "__main__":
    print("Running VAPI-Terminator Integration Script Example...")

    # Example 1: Open an app
    example_data_app = {
        "summary": "User wants to open Notepad",
        "structuredData": {
            "appName": "notepad", # Use executable name if possible
            "searchQuery": None
        }
    }
    process_vapi_data(example_data_app)
    sleep(2) # Pause between examples

    # Example 2: Search the web
    example_data_search = {
        "summary": "User wants to search for cute cat videos on Google",
        "structuredData": {
            "appName": None,
            "searchQuery": "cute cat videos"
        }
    }
    process_vapi_data(example_data_search)
    sleep(2)

    # Example 3: Open a specific URL
    example_data_url = {
        "summary": "User wants to go to GitHub",
        "structuredData": {
            "appName": None,
            "searchQuery": "https://github.com"
        }
    }
    process_vapi_data(example_data_url)
    sleep(2)

    # Example 4: Request involves typing (basic handling)
    example_data_type = {
        "summary": "User wants to type Happy Birthday into the current app",
        "structuredData": {
            "appName": None, # Could potentially include appName if known
            "searchQuery": "Happy Birthday"
        }
    }
    process_vapi_data(example_data_type)

    # Example 5: No action
    example_data_none = {
        "summary": "User asked about the weather",
        "structuredData": {
            "appName": None,
            "searchQuery": None
        }
    }
    process_vapi_data(example_data_none)

    print("\nExample script finished.")

    # Keep the script running briefly if Terminator needs time
    if TERMINATOR_AVAILABLE:
        print("Waiting a few seconds for Terminator actions to potentially complete...")
        sleep(5)

    print("Exiting.")
    sys.exit(0) 