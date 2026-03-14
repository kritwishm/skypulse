import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://localhost/skypulse")
# Railway uses postgres:// scheme, SQLAlchemy needs postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production-use-a-real-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))  # 24h

# Server
HOST = os.getenv("SKYPULSE_HOST", "0.0.0.0")
PORT = int(os.getenv("SKYPULSE_PORT", "8000"))

# Frontend URL (for CORS)
FRONTEND_URL = os.getenv("SKYPULSE_FRONTEND_URL", "http://localhost:3000")

# Defaults
DEFAULT_CURRENCY = "INR"
DEFAULT_TRIP_TYPE = "one-way"
DEFAULT_HISTORY_LIMIT = 20
