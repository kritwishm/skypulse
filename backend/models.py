from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


# ── Auth ──

class AuthRequest(BaseModel):
    username: str
    password: str


class UserPublic(BaseModel):
    id: str
    username: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


# ── Flights ──

class FlightWatchCreate(BaseModel):
    origin: str
    destination: str
    departure_date: str  # YYYY-MM-DD (range start)
    departure_date_end: Optional[str] = None  # YYYY-MM-DD (range end, omit for single date)
    return_date: Optional[str] = None
    return_date_end: Optional[str] = None
    trip_type: str = "one-way"  # "one-way" or "round-trip"
    currency: str = "INR"
    max_price: Optional[int] = None
    max_stops: Optional[int] = None  # None=any, 0=nonstop, 1=1-stop, 2=2-stop


class FlightWatchUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    departure_date: Optional[str] = None
    departure_date_end: Optional[str] = None
    return_date: Optional[str] = None
    return_date_end: Optional[str] = None
    trip_type: Optional[str] = None
    currency: Optional[str] = None
    max_price: Optional[int] = None
    max_stops: Optional[int] = None


class FlightWatch(BaseModel):
    id: str  # UUID string
    origin: str
    destination: str
    departure_date: str
    departure_date_end: Optional[str] = None
    return_date: Optional[str] = None
    return_date_end: Optional[str] = None
    trip_type: str = "one-way"
    currency: str = "INR"
    max_price: Optional[int] = None
    max_stops: Optional[int] = None  # None=any, 0=nonstop, 1=1-stop, 2=2-stop
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_checked: Optional[datetime] = None
    cheapest_price: Optional[int] = None
    cheapest_date: Optional[str] = None  # which departure date had the cheapest
    status: str = "idle"


class PriceHistoryEntry(BaseModel):
    id: int
    flight_id: str
    cheapest: int
    low: Optional[int] = None
    high: Optional[int] = None
    result_count: int = 0
    checked_at: str


class FlightResult(BaseModel):
    price: int
    departure_date: Optional[str] = None  # which date this result is for
    return_date: Optional[str] = None
    legs: list[dict]
    google_flights_url: Optional[str] = None


class FlightCheckResult(BaseModel):
    cheapest_price: int
    cheapest_date: Optional[str] = None  # departure date of cheapest
    price_range: dict  # {"low": int, "high": int}
    result_count: int
    results: list[FlightResult]
    checked_at: str
