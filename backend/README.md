# SkyPulse Backend

FastAPI backend that scrapes Google Flights via the `swoop-flights` package, streams real-time results over WebSocket, and persists watchlist + price history locally.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Server | Uvicorn (ASGI) |
| Flight Data | `swoop-flights` (Google Flights scraper) |
| Database | SQLite (price history) |
| Persistence | JSON file (watchlist) |
| Validation | Pydantic v2 |
| Python | 3.13 |

## Project Structure

```
backend/
  main.py               # FastAPI app, CORS, lifespan (DB init on startup)
  config.py             # Paths, env vars, defaults
  models.py             # All Pydantic schemas
  flight_checker.py     # Core search logic: date ranges, swoop calls, post-filtering
  ws_handler.py         # WebSocket handler: concurrent checks, safe sends, deal alerts
  watchlist.py          # Thread-safe JSON CRUD with threading.Lock
  price_history.py      # SQLite table for price tracking over time
  google_flights_url.py # Builds Google Flights deep-link URLs via protobuf encoding
  routers/
    flights.py          # REST API endpoints for CRUD + history
  data/                 # Runtime data (auto-created)
    watchlist.json      # Flight watchlist
    skypulse.db         # SQLite price history database
  requirements.txt      # Python dependencies
  env/                  # Virtual environment (not committed)
```

## Setup & Running

```bash
# Create venv and install dependencies
cd backend
python3.13 -m venv env
source env/bin/activate
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Or from the project root (starts both backend + frontend):
./start.sh
```

### Dependencies

```
fastapi
uvicorn[standard]
pydantic
swoop-flights
```

## Configuration

All configuration lives in `config.py` with env var overrides:

| Variable | Env Var | Default |
|----------|---------|---------|
| `HOST` | `SKYPULSE_HOST` | `127.0.0.1` |
| `PORT` | `SKYPULSE_PORT` | `8000` |
| `FRONTEND_URL` | `SKYPULSE_FRONTEND_URL` | `http://localhost:3000` |

### File Paths

| Constant | Path |
|----------|------|
| `DATA_DIR` | `backend/data/` |
| `WATCHLIST_FILE` | `backend/data/watchlist.json` |
| `DATABASE_FILE` | `backend/data/skypulse.db` |

### Application Defaults

| Constant | Value |
|----------|-------|
| `DEFAULT_CURRENCY` | `INR` |
| `DEFAULT_TRIP_TYPE` | `one-way` |
| `DEFAULT_HISTORY_LIMIT` | `20` |

## API Reference

### REST Endpoints

All endpoints are prefixed with `/api/flights`.

#### `GET /api/flights/`

List all flight watches.

**Response:** `200` — `FlightWatch[]`

#### `POST /api/flights/`

Create a new flight watch.

**Request Body:** `FlightWatchCreate`

```json
{
  "origin": "BLR",
  "destination": "DXB",
  "departure_date": "2026-04-01",
  "departure_date_end": "2026-04-05",
  "return_date": null,
  "return_date_end": null,
  "trip_type": "one-way",
  "currency": "INR",
  "max_price": 15000,
  "max_stops": 0
}
```

**Response:** `201` — `FlightWatch`

#### `GET /api/flights/{flight_id}`

Get a single flight watch.

**Response:** `200` — `FlightWatch`
**Error:** `404` — `{"detail": "Flight not found"}`

#### `PATCH /api/flights/{flight_id}`

Update a flight watch. Only include fields to change.

**Request Body:** `FlightWatchUpdate` (all fields optional)

**Response:** `200` — `FlightWatch`
**Errors:** `400` (no fields), `404` (not found)

#### `DELETE /api/flights/{flight_id}`

Delete a flight watch.

**Response:** `204` — No content
**Error:** `404` — `{"detail": "Flight not found"}`

#### `GET /api/flights/{flight_id}/history`

Get price history for a flight.

**Query Params:** `limit` (int, default 20)

**Response:** `200` — `PriceHistoryEntry[]`

### WebSocket Protocol

Connect to `ws://localhost:8000/ws`.

#### Client Messages (outgoing)

| Type | Payload | Description |
|------|---------|-------------|
| `check_all` | `{}` | Check all flights in the watchlist |
| `check_one` | `{ "id": "<flight_id>" }` | Check a single flight |

#### Server Messages (incoming)

| Type | Payload | Description |
|------|---------|-------------|
| `connected` | `{ "watchlist_count": int }` | Sent on connection |
| `flight_status` | `{ "id": str, "status": "checking" }` | Flight check started |
| `flight_result` | `{ "id": str, "result": FlightCheckResult }` | Check complete with results |
| `flight_error` | `{ "id": str, "error": str }` | Check failed |
| `deal_alert` | `{ "id": str, "cheapest_price": int, "max_price": int, "message": str }` | Price at or below budget |
| `check_all_complete` | `{ "count": int }` | All flights finished checking |
| `error` | `{ "error": str }` | General error (bad JSON, unknown type, empty watchlist) |

## Core Modules

### flight_checker.py

The search engine. Takes a `FlightWatch` and returns a `FlightCheckResult`.

**Date Range Logic:**
- `_date_range()` generates dates from `departure_date` to `departure_date_end`, capped at **15 days** (`MAX_RANGE_DAYS`)
- For round trips, it generates all `(departure, return)` combos using `itertools.product`, filtering out pairs where return <= departure
- Each combo triggers a separate `swoop.search()` call
- All results are aggregated, sorted by price, and returned

**Stop Filtering:**
- `max_stops` is passed to swoop as an upper bound (0 = nonstop, 1 = one-or-fewer)
- Results are then **post-filtered** for the exact stop count, since swoop returns "up to N stops"

**Error Handling:**
- Individual date failures are counted; only returns `None` if all dates failed
- `SwoopError` exceptions are caught per-date so partial results still return

### ws_handler.py

Manages the WebSocket connection lifecycle and concurrent flight checks.

**Concurrency:**
- `asyncio.Semaphore(3)` caps parallel flight searches to 3 concurrent
- Each `check_flight()` call runs in a thread via `asyncio.to_thread()` (swoop is synchronous)
- `check_all` dispatches all flights with `asyncio.gather()`

**Safe Send Pattern:**
- `_safe_send()` checks `ws.client_state` before sending — prevents crashes when client disconnects mid-check
- Returns `False` if client is gone, allowing early exit from the check flow

**Persistence Independence:**
- Watchlist updates and price history writes happen **regardless** of client connection state
- Even if the client disconnects, data is still saved

**Deal Alerts:**
- After a successful check, compares `cheapest_price` against `max_price` (budget)
- If cheapest <= budget, sends a `deal_alert` message

### watchlist.py

Thread-safe CRUD for the JSON-file-backed watchlist.

- `threading.Lock` guards all reads/writes to `watchlist.json`
- `_ensure_file()` creates the file with `[]` if it doesn't exist
- `add_flight()` generates a UUID, creates a `FlightWatch`, appends and saves
- `update_flight()` uses `model_copy(update=kwargs)` for partial updates
- `delete_flight()` filters by ID and returns `True`/`False`

### price_history.py

SQLite-backed price tracking.

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id TEXT NOT NULL,
    cheapest INTEGER NOT NULL,
    low INTEGER,
    high INTEGER,
    result_count INTEGER DEFAULT 0,
    checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ph_flight
ON price_history(flight_id, checked_at DESC);
```

- `init_db()` — called on startup via lifespan, creates table + index
- `record_price()` — inserts a row after each successful check
- `get_history()` — returns last N entries for a flight, ordered by `checked_at DESC`

### google_flights_url.py

Builds deep-link URLs to Google Flights using protobuf encoding.

- Uses `TFSData.from_interface()` from `swoop.builders` to encode search legs
- Generates `SearchLeg` objects for outbound (and return if round-trip)
- Encodes to base64 via `.as_b64()` and appends to `https://www.google.com/travel/flights?tfs=`

## Data Models

### FlightWatchCreate

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `origin` | `str` | required | Airport code (e.g., "BLR") |
| `destination` | `str` | required | Airport code (e.g., "DXB") |
| `departure_date` | `str` | required | YYYY-MM-DD |
| `departure_date_end` | `str \| null` | `null` | End of departure date range |
| `return_date` | `str \| null` | `null` | Return date (round-trip) |
| `return_date_end` | `str \| null` | `null` | End of return date range |
| `trip_type` | `str` | `"one-way"` | `"one-way"` or `"round-trip"` |
| `currency` | `str` | `"INR"` | Currency code |
| `max_price` | `int \| null` | `null` | Budget threshold for deal alerts |
| `max_stops` | `int \| null` | `null` | `null`=any, `0`=nonstop, `1`=1-stop, `2`=2-stop |

### FlightWatchUpdate

Same fields as `FlightWatchCreate`, all optional. Only include fields to change.

### FlightWatch

Extends `FlightWatchCreate` with server-managed fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `str` | UUID |
| `created_at` | `datetime` | UTC timestamp |
| `last_checked` | `datetime \| null` | Last check time |
| `cheapest_price` | `int \| null` | Last known cheapest price |
| `cheapest_date` | `str \| null` | Departure date of cheapest |
| `status` | `str` | `"idle"`, `"checking"`, or `"error"` |

### FlightCheckResult

| Field | Type | Description |
|-------|------|-------------|
| `cheapest_price` | `int` | Lowest price found |
| `cheapest_date` | `str \| null` | Departure date of cheapest |
| `price_range` | `{"low": int, "high": int}` | Price range across all results |
| `result_count` | `int` | Total number of flight options |
| `results` | `FlightResult[]` | All flight options, sorted by price |
| `checked_at` | `str` | ISO 8601 UTC timestamp |

### FlightResult

| Field | Type | Description |
|-------|------|-------------|
| `price` | `int` | Price in the requested currency |
| `departure_date` | `str \| null` | Which date this result is for |
| `return_date` | `str \| null` | Return date (if round-trip) |
| `legs` | `list[dict]` | Trip legs with airline, times, duration, stops |
| `google_flights_url` | `str \| null` | Deep link to Google Flights |

### PriceHistoryEntry

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-increment ID |
| `flight_id` | `str` | FK to flight watch |
| `cheapest` | `int` | Cheapest price at check time |
| `low` | `int \| null` | Low end of price range |
| `high` | `int \| null` | High end of price range |
| `result_count` | `int` | Number of results found |
| `checked_at` | `str` | ISO 8601 UTC timestamp |
