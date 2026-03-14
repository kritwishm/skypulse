from __future__ import annotations

from swoop.builders import Passengers, SearchLeg, TFSData


def build_google_flights_url(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: str | None = None,
) -> str:
    """Build a Google Flights deep-link URL using protobuf-encoded tfs param."""
    legs = [SearchLeg(date=departure_date, from_airport=origin, to_airport=destination)]

    if return_date:
        legs.append(SearchLeg(date=return_date, from_airport=destination, to_airport=origin))
        trip = "round-trip"
    else:
        trip = "one-way"

    tfs = TFSData.from_interface(
        flight_data=legs,
        seat="economy",
        trip=trip,
        passengers=Passengers(adults=1),
    )
    return f"https://www.google.com/travel/flights?tfs={tfs.as_b64().decode()}"
