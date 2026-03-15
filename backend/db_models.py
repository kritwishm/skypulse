from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class FlightWatchRow(Base):
    __tablename__ = "flight_watches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    origin: Mapped[str] = mapped_column(String(10), nullable=False)
    destination: Mapped[str] = mapped_column(String(10), nullable=False)
    departure_date: Mapped[str] = mapped_column(String(10), nullable=False)
    departure_date_end: Mapped[str | None] = mapped_column(String(10), nullable=True)
    return_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    return_date_end: Mapped[str | None] = mapped_column(String(10), nullable=True)
    trip_type: Mapped[str] = mapped_column(String(16), default="one-way")
    currency: Mapped[str] = mapped_column(String(8), default="INR")
    max_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_stops: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    last_checked: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cheapest_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cheapest_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="idle")


class PriceHistoryRow(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    flight_id: Mapped[str] = mapped_column(String(36), ForeignKey("flight_watches.id", ondelete="CASCADE"), nullable=False)
    cheapest: Mapped[int] = mapped_column(Integer, nullable=False)
    low: Mapped[int | None] = mapped_column(Integer, nullable=True)
    high: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result_count: Mapped[int] = mapped_column(Integer, default=0)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    __table_args__ = (
        Index("idx_ph_flight", "flight_id", checked_at.desc()),
    )
