from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from flight_checker import check_flight
from price_history import record_price
from watchlist import get_flight, list_flights, update_flight

logger = logging.getLogger(__name__)

_semaphore = asyncio.Semaphore(3)


async def _safe_send(ws: WebSocket, data: dict) -> bool:
    """Send JSON to the WebSocket, return False if the client is gone."""
    if ws.client_state != WebSocketState.CONNECTED:
        return False
    try:
        await ws.send_json(data)
        return True
    except (WebSocketDisconnect, RuntimeError):
        return False


async def _check_single_flight(ws: WebSocket, flight_id: str) -> None:
    """Check a single flight, stream status updates, and persist results."""
    flight = get_flight(flight_id)
    if flight is None:
        await _safe_send(ws, {"type": "flight_error", "id": flight_id, "error": "Flight not found"})
        return

    update_flight(flight_id, status="checking")
    if not await _safe_send(ws, {"type": "flight_status", "id": flight_id, "status": "checking"}):
        return

    try:
        async with _semaphore:
            result = await asyncio.to_thread(check_flight, flight)

        if result is None:
            update_flight(flight_id, status="error")
            await _safe_send(ws, {"type": "flight_error", "id": flight_id, "error": "Check failed"})
            return

        # Persist regardless of client state
        update_flight(
            flight_id,
            status="idle",
            last_checked=datetime.now(timezone.utc),
            cheapest_price=result.cheapest_price,
            cheapest_date=result.cheapest_date,
        )

        if result.result_count > 0:
            record_price(
                flight_id=flight_id,
                cheapest=result.cheapest_price,
                low=result.price_range.get("low"),
                high=result.price_range.get("high"),
                result_count=result.result_count,
            )

        # Stream result to client (skip if disconnected)
        if not await _safe_send(ws, {
            "type": "flight_result",
            "id": flight_id,
            "result": result.model_dump(mode="json"),
        }):
            return

        # Deal alert
        refreshed = get_flight(flight_id)
        if (
            refreshed
            and refreshed.max_price is not None
            and result.cheapest_price > 0
            and result.cheapest_price <= refreshed.max_price
        ):
            await _safe_send(ws, {
                "type": "deal_alert",
                "id": flight_id,
                "cheapest_price": result.cheapest_price,
                "max_price": refreshed.max_price,
                "message": (
                    f"Deal found! {refreshed.origin} -> {refreshed.destination} "
                    f"at {result.cheapest_price} (target: {refreshed.max_price})"
                ),
            })

    except Exception:
        logger.exception("Error during flight check for %s", flight_id)
        update_flight(flight_id, status="error")
        await _safe_send(ws, {"type": "flight_error", "id": flight_id, "error": "Check failed"})


async def websocket_handler(ws: WebSocket) -> None:
    await ws.accept()

    flights = list_flights()
    await _safe_send(ws, {"type": "connected", "watchlist_count": len(flights)})

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await _safe_send(ws, {"type": "error", "error": "Invalid JSON"})
                continue

            msg_type = msg.get("type")

            if msg_type == "check_all":
                flights = list_flights()
                if not flights:
                    await _safe_send(ws, {"type": "error", "error": "No flights in watchlist"})
                    continue

                tasks = [_check_single_flight(ws, f.id) for f in flights]
                await asyncio.gather(*tasks, return_exceptions=True)
                await _safe_send(ws, {"type": "check_all_complete", "count": len(flights)})

            elif msg_type == "check_one":
                flight_id = msg.get("id")
                if not flight_id:
                    await _safe_send(ws, {"type": "error", "error": "Missing flight id"})
                    continue
                await _check_single_flight(ws, flight_id)

            else:
                await _safe_send(ws, {"type": "error", "error": f"Unknown message type: {msg_type}"})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception:
        logger.exception("WebSocket error")
