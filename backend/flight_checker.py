from __future__ import annotations

import logging
from datetime import date, datetime, timedelta, timezone
from itertools import product

from swoop import search
from swoop.builders import Passengers, SearchLeg, TFSData
from swoop.exceptions import SwoopError

from google_flights_url import build_google_flights_url
from models import FlightCheckResult, FlightResult, FlightWatch

logger = logging.getLogger(__name__)

MAX_RANGE_DAYS = 15  # cap per-leg date range to avoid too many API calls


def _format_time(t: tuple[int, int] | None) -> str:
    if not t or t[0] is None or t[1] is None:
        return ""
    return f"{t[0]:02d}:{t[1]:02d}"


def _format_duration(minutes: int) -> str:
    h, m = divmod(minutes, 60)
    return f"{h}h {m}m" if h else f"{m}m"


def _format_stops(stops: int | None) -> str:
    if stops is None:
        return ""
    if stops == 0:
        return "Nonstop"
    return f"{stops} stop{'s' if stops > 1 else ''}"


def _date_range(start: str, end: str | None) -> list[str]:
    """Generate list of YYYY-MM-DD strings from start to end inclusive, capped."""
    d_start = date.fromisoformat(start)
    if not end:
        return [start]
    d_end = date.fromisoformat(end)
    if d_end <= d_start:
        return [start]
    days = min((d_end - d_start).days, MAX_RANGE_DAYS)
    return [(d_start + timedelta(days=i)).isoformat() for i in range(days + 1)]


def _search_single_date(
    flight: FlightWatch,
    dep_date: str,
    ret_date: str | None,
    requested_stops: int | None,
) -> list[FlightResult]:
    """Search a single departure+return date combo, return parsed results."""
    search_kwargs: dict = {
        "origin": flight.origin,
        "destination": flight.destination,
        "date": dep_date,
    }

    if flight.trip_type == "round-trip" and ret_date:
        search_kwargs["return_date"] = ret_date

    if requested_stops is not None:
        search_kwargs["max_stops"] = requested_stops

    result = search(**search_kwargs)

    if not result.results:
        return []

    google_url = build_google_flights_url(
        origin=flight.origin,
        destination=flight.destination,
        departure_date=dep_date,
        return_date=ret_date,
    )

    parsed: list[FlightResult] = []

    for option in result.results:
        price = option.price
        if not price or price <= 0:
            continue

        legs = []
        for trip_leg in option.legs:
            leg_data: dict = {
                "departure_time": None,
                "arrival_time": None,
                "duration": None,
                "stops": None,
                "airline": None,
                "airline_logo_url": None,
            }

            if trip_leg.itinerary:
                it = trip_leg.itinerary
                leg_data["departure_time"] = _format_time(it.departure_time)
                leg_data["arrival_time"] = _format_time(it.arrival_time)
                leg_data["duration"] = _format_duration(it.travel_time) if it.travel_time else None
                leg_data["stops"] = _format_stops(it.stop_count)
                leg_data["airline"] = ", ".join(it.airline_names) if it.airline_names else None

            legs.append(leg_data)

        parsed.append(
            FlightResult(
                price=price,
                departure_date=dep_date,
                return_date=ret_date,
                legs=legs,
                google_flights_url=google_url,
            )
        )

    # Post-filter for exact stop count
    if requested_stops is not None and requested_stops > 0:
        parsed = [
            r for r in parsed
            if r.legs and r.legs[0].get("stops") == _format_stops(requested_stops)
        ]

    return parsed


def check_flight(flight: FlightWatch) -> FlightCheckResult | None:
    """Check prices across the full date range. Returns None on failure."""
    try:
        requested_stops = flight.max_stops

        dep_dates = _date_range(flight.departure_date, flight.departure_date_end)

        if flight.trip_type == "round-trip" and flight.return_date:
            ret_dates = _date_range(flight.return_date, flight.return_date_end)
        else:
            ret_dates = [None]

        # Build date combos — for round trips, ensure return >= departure
        date_combos: list[tuple[str, str | None]] = []
        for dep, ret in product(dep_dates, ret_dates):
            if ret is not None and ret <= dep:
                continue
            date_combos.append((dep, ret))

        if not date_combos:
            # Fallback: single date
            date_combos = [(flight.departure_date, flight.return_date)]

        all_results: list[FlightResult] = []
        errors = 0

        for dep_date, ret_date in date_combos:
            try:
                results = _search_single_date(flight, dep_date, ret_date, requested_stops)
                all_results.extend(results)
            except SwoopError as e:
                logger.warning("Swoop error for %s on %s: %s", flight.id, dep_date, e)
                errors += 1
            except Exception:
                logger.exception("Error searching %s on %s", flight.id, dep_date)
                errors += 1

        checked_at = datetime.now(timezone.utc).isoformat()

        if not all_results:
            if errors == len(date_combos):
                # All dates failed
                return None
            return FlightCheckResult(
                cheapest_price=0,
                cheapest_date=None,
                price_range={"low": 0, "high": 0},
                result_count=0,
                results=[],
                checked_at=checked_at,
            )

        all_results.sort(key=lambda r: r.price)
        prices = [r.price for r in all_results]

        return FlightCheckResult(
            cheapest_price=min(prices),
            cheapest_date=all_results[0].departure_date,
            price_range={"low": min(prices), "high": max(prices)},
            result_count=len(all_results),
            results=all_results,
            checked_at=checked_at,
        )

    except SwoopError as e:
        logger.error("Swoop error checking flight %s: %s", flight.id, e)
        return None
    except Exception:
        logger.exception("Error checking flight %s", flight.id)
        return None
