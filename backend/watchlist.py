from __future__ import annotations

import json
import threading
import uuid
from datetime import datetime, timezone
from typing import Optional

from config import WATCHLIST_FILE
from models import FlightWatch, FlightWatchCreate

_lock = threading.Lock()


def _ensure_file() -> None:
    if not WATCHLIST_FILE.exists():
        WATCHLIST_FILE.parent.mkdir(parents=True, exist_ok=True)
        WATCHLIST_FILE.write_text("[]", encoding="utf-8")


def load_watchlist() -> list[FlightWatch]:
    _ensure_file()
    with _lock:
        raw = json.loads(WATCHLIST_FILE.read_text(encoding="utf-8"))
    return [FlightWatch(**item) for item in raw]


def save_watchlist(flights: list[FlightWatch]) -> None:
    _ensure_file()
    with _lock:
        data = [f.model_dump(mode="json") for f in flights]
        WATCHLIST_FILE.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


def add_flight(create: FlightWatchCreate) -> FlightWatch:
    flights = load_watchlist()
    flight = FlightWatch(
        id=str(uuid.uuid4()),
        **create.model_dump(),
        created_at=datetime.now(timezone.utc),
    )
    flights.append(flight)
    save_watchlist(flights)
    return flight


def get_flight(flight_id: str) -> Optional[FlightWatch]:
    flights = load_watchlist()
    for f in flights:
        if f.id == flight_id:
            return f
    return None


def update_flight(flight_id: str, **kwargs) -> Optional[FlightWatch]:
    flights = load_watchlist()
    for i, f in enumerate(flights):
        if f.id == flight_id:
            updated = f.model_copy(update=kwargs)
            flights[i] = updated
            save_watchlist(flights)
            return updated
    return None


def delete_flight(flight_id: str) -> bool:
    flights = load_watchlist()
    original_len = len(flights)
    flights = [f for f in flights if f.id != flight_id]
    if len(flights) < original_len:
        save_watchlist(flights)
        return True
    return False


def list_flights() -> list[FlightWatch]:
    return load_watchlist()
