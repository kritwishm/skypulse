import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

WATCHLIST_FILE = DATA_DIR / "watchlist.json"
DATABASE_FILE = DATA_DIR / "skypulse.db"

# Server
HOST = os.getenv("SKYPULSE_HOST", "127.0.0.1")
PORT = int(os.getenv("SKYPULSE_PORT", "8000"))

# Frontend URL (for CORS)
FRONTEND_URL = os.getenv("SKYPULSE_FRONTEND_URL", "http://localhost:3000")

# Defaults
DEFAULT_CURRENCY = "INR"
DEFAULT_TRIP_TYPE = "one-way"
DEFAULT_HISTORY_LIMIT = 20
