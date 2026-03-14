from __future__ import annotations

import sqlite3
from datetime import datetime, timezone

from config import DATABASE_FILE
from models import PriceHistoryEntry

_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id TEXT NOT NULL,
    cheapest INTEGER NOT NULL,
    low INTEGER,
    high INTEGER,
    result_count INTEGER DEFAULT 0,
    checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

_CREATE_INDEX = """
CREATE INDEX IF NOT EXISTS idx_ph_flight ON price_history(flight_id, checked_at DESC);
"""


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DATABASE_FILE))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = _get_conn()
    try:
        conn.execute(_CREATE_TABLE)
        conn.execute(_CREATE_INDEX)
        conn.commit()
    finally:
        conn.close()


def record_price(
    flight_id: str,
    cheapest: int,
    low: int | None = None,
    high: int | None = None,
    result_count: int = 0,
) -> PriceHistoryEntry:
    conn = _get_conn()
    try:
        checked_at = datetime.now(timezone.utc).isoformat()
        cursor = conn.execute(
            """
            INSERT INTO price_history (flight_id, cheapest, low, high, result_count, checked_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (flight_id, cheapest, low, high, result_count, checked_at),
        )
        conn.commit()
        return PriceHistoryEntry(
            id=cursor.lastrowid,
            flight_id=flight_id,
            cheapest=cheapest,
            low=low,
            high=high,
            result_count=result_count,
            checked_at=checked_at,
        )
    finally:
        conn.close()


def get_history(flight_id: str, limit: int = 20) -> list[PriceHistoryEntry]:
    conn = _get_conn()
    try:
        rows = conn.execute(
            """
            SELECT id, flight_id, cheapest, low, high, result_count, checked_at
            FROM price_history
            WHERE flight_id = ?
            ORDER BY checked_at DESC
            LIMIT ?
            """,
            (flight_id, limit),
        ).fetchall()
        return [PriceHistoryEntry(**dict(row)) for row in rows]
    finally:
        conn.close()
