import sys
import os

# Resolve the backend directory relative to this file's real location
_here = os.path.dirname(os.path.realpath(__file__))
_backend = os.path.join(_here, "..", "backend")
_backend = os.path.normpath(os.path.abspath(_backend))

if _backend not in sys.path:
    sys.path.insert(0, _backend)

# Import the FastAPI app from the backend
from main import app
