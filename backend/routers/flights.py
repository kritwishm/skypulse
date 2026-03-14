from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from db_models import User
from models import FlightWatch, FlightWatchCreate, FlightWatchUpdate
from price_history import get_history
from watchlist import add_flight, delete_flight, get_flight, get_flight_owner, list_flights, update_flight

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("", response_model=list[FlightWatch])
@router.get("/", response_model=list[FlightWatch])
async def get_all_flights(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await list_flights(db, user.id)


@router.post("", response_model=FlightWatch, status_code=201)
@router.post("/", response_model=FlightWatch, status_code=201)
async def create_flight(
    body: FlightWatchCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await add_flight(db, user.id, body)


@router.get("/{flight_id}", response_model=FlightWatch)
async def get_one_flight(
    flight_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    owner = await get_flight_owner(db, flight_id)
    if owner is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    if owner != user.id:
        raise HTTPException(status_code=403, detail="Not your flight")
    return await get_flight(db, flight_id)


@router.patch("/{flight_id}", response_model=FlightWatch)
async def edit_flight(
    flight_id: str,
    body: FlightWatchUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    owner = await get_flight_owner(db, flight_id)
    if owner is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    if owner != user.id:
        raise HTTPException(status_code=403, detail="Not your flight")
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updated = await update_flight(db, flight_id, **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    return updated


@router.delete("/{flight_id}", status_code=204)
async def remove_flight(
    flight_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    owner = await get_flight_owner(db, flight_id)
    if owner is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    if owner != user.id:
        raise HTTPException(status_code=403, detail="Not your flight")
    await delete_flight(db, flight_id)
    return None


@router.get("/{flight_id}/history")
async def get_flight_history(
    flight_id: str,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    owner = await get_flight_owner(db, flight_id)
    if owner is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    if owner != user.id:
        raise HTTPException(status_code=403, detail="Not your flight")
    return await get_history(db, flight_id, limit=limit)
