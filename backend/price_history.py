from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import PriceHistoryRow
from models import PriceHistoryEntry


async def record_price(
    db: AsyncSession,
    flight_id: str,
    cheapest: int,
    low: int | None = None,
    high: int | None = None,
    result_count: int = 0,
) -> PriceHistoryEntry:
    row = PriceHistoryRow(
        flight_id=flight_id,
        cheapest=cheapest,
        low=low,
        high=high,
        result_count=result_count,
        checked_at=datetime.now(timezone.utc),
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return PriceHistoryEntry(
        id=row.id,
        flight_id=row.flight_id,
        cheapest=row.cheapest,
        low=row.low,
        high=row.high,
        result_count=row.result_count,
        checked_at=row.checked_at.isoformat() if row.checked_at else "",
    )


async def get_history(db: AsyncSession, flight_id: str, limit: int = 20) -> list[PriceHistoryEntry]:
    result = await db.execute(
        select(PriceHistoryRow)
        .where(PriceHistoryRow.flight_id == flight_id)
        .order_by(PriceHistoryRow.checked_at.desc())
        .limit(limit)
    )
    return [
        PriceHistoryEntry(
            id=row.id,
            flight_id=row.flight_id,
            cheapest=row.cheapest,
            low=row.low,
            high=row.high,
            result_count=row.result_count,
            checked_at=row.checked_at.isoformat() if row.checked_at else "",
        )
        for row in result.scalars().all()
    ]
