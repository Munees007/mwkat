import os
import sys

# Add backend directory to path so imports work seamlessly
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.main import app

# Export app for Vercel serverless functions
app = app