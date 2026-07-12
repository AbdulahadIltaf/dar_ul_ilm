import sys
import os

# Add the backend directory to sys.path so all backend imports work
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_dir)

# Import the FastAPI app from backend
from main import app
