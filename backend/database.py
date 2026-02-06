import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

logger = logging.getLogger(__name__)

# Read from environment
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

if not MONGO_URI or not MONGO_DB_NAME:
    raise RuntimeError(
        "MongoDB configuration missing. "
        "Please set MONGO_URI and MONGO_DB_NAME in .env"
    )

# Create Mongo client
client = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000
)

# Database instance
db = client[MONGO_DB_NAME]


async def connect_to_mongo():
    """Verify MongoDB connection on startup"""
    try:
        await client.admin.command("ping")
        logger.info("✅ Connected to MongoDB successfully")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise e


async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    client.close()
    logger.info("🔌 MongoDB connection closed")

