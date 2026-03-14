from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config import DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """FastAPI dependency that yields an async DB session."""
    async with async_session_maker() as session:
        yield session


async def init_db():
    """Create all tables on startup."""
    from db_models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
