from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import FlightWatchRow
from models import FlightWatch, FlightWatchCreate


def _row_to_model(row: FlightWatchRow) -> FlightWatch:
    return FlightWatch(
        id=row.id,
        origin=row.origin,
        destination=row.destination,
        departure_date=row.departure_date,
        departure_date_end=row.departure_date_end,
        return_date=row.return_date,
        return_date_end=row.return_date_end,
        trip_type=row.trip_type,
        currency=row.currency,
        max_price=row.max_price,
        max_stops=row.max_stops,
        created_at=row.created_at or datetime.now(timezone.utc),
        last_checked=row.last_checked,
        cheapest_price=row.cheapest_price,
        cheapest_date=row.cheapest_date,
        status=row.status,
    )


async def list_flights(db: AsyncSession, user_id: str) -> list[FlightWatch]:
    result = await db.execute(
        select(FlightWatchRow).where(FlightWatchRow.user_id == user_id).order_by(FlightWatchRow.created_at.desc())
    )
    return [_row_to_model(row) for row in result.scalars().all()]


async def add_flight(db: AsyncSession, user_id: str, create: FlightWatchCreate) -> FlightWatch:
    row = FlightWatchRow(user_id=user_id, **create.model_dump())
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return _row_to_model(row)


async def get_flight(db: AsyncSession, flight_id: str) -> FlightWatch | None:
    result = await db.execute(select(FlightWatchRow).where(FlightWatchRow.id == flight_id))
    row = result.scalar_one_or_none()
    return _row_to_model(row) if row else None


async def get_flight_owner(db: AsyncSession, flight_id: str) -> str | None:
    """Return the user_id that owns this flight, or None."""
    result = await db.execute(select(FlightWatchRow.user_id).where(FlightWatchRow.id == flight_id))
    return result.scalar_one_or_none()


async def update_flight(db: AsyncSession, flight_id: str, **kwargs) -> FlightWatch | None:
    result = await db.execute(select(FlightWatchRow).where(FlightWatchRow.id == flight_id))
    row = result.scalar_one_or_none()
    if row is None:
        return None
    for key, value in kwargs.items():
        setattr(row, key, value)
    await db.commit()
    await db.refresh(row)
    return _row_to_model(row)


async def delete_flight(db: AsyncSession, flight_id: str) -> bool:
    result = await db.execute(select(FlightWatchRow).where(FlightWatchRow.id == flight_id))
    row = result.scalar_one_or_none()
    if row is None:
        return False
    await db.delete(row)
    await db.commit()
    return True
