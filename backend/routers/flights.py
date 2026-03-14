from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models import FlightWatch, FlightWatchCreate, FlightWatchUpdate
from price_history import get_history
from watchlist import add_flight, delete_flight, get_flight, list_flights, update_flight

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("", response_model=list[FlightWatch])
@router.get("/", response_model=list[FlightWatch])
async def get_all_flights():
    return list_flights()


@router.post("", response_model=FlightWatch, status_code=201)
@router.post("/", response_model=FlightWatch, status_code=201)
async def create_flight(body: FlightWatchCreate):
    return add_flight(body)


@router.get("/{flight_id}", response_model=FlightWatch)
async def get_one_flight(flight_id: str):
    flight = get_flight(flight_id)
    if flight is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight


@router.patch("/{flight_id}", response_model=FlightWatch)
async def edit_flight(flight_id: str, body: FlightWatchUpdate):
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updated = update_flight(flight_id, **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    return updated


@router.delete("/{flight_id}", status_code=204)
async def remove_flight(flight_id: str):
    if not delete_flight(flight_id):
        raise HTTPException(status_code=404, detail="Flight not found")
    return None


@router.get("/{flight_id}/history")
async def get_flight_history(flight_id: str, limit: int = 20):
    flight = get_flight(flight_id)
    if flight is None:
        raise HTTPException(status_code=404, detail="Flight not found")
    return get_history(flight_id, limit=limit)
