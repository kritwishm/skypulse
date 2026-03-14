# SkyPulse — Flight Price Tracker

Track flight prices in real-time with deal alerts. SkyPulse scrapes Google Flights via [swoop-flights](https://pypi.org/project/swoop-flights/), streams results over WebSocket, and alerts you when prices drop below your budget.

## Features

- **Date range search** — search across a span of departure/return dates (up to 15 days) and find the absolute cheapest
- **Real-time streaming** — WebSocket pushes results as each flight check completes, no polling
- **Deal alerts** — set a max price per watch; get a visual alert with confetti when price drops under budget
- **Auto-refresh** — configurable polling at 5/10/15/30 minute intervals with live countdown
- **Price history** — SQLite-backed history with inline sparkline charts on each card
- **Stop filtering** — filter by nonstop, 1-stop, or 2-stop with exact post-filtering
- **Google Flights deep links** — every result links directly to Google Flights with protobuf-encoded TFS URLs
- **Dark UI** — dark grey + blue palette, glassmorphic cards, animated price counters, Framer Motion transitions

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, WebSocket, swoop-flights, SQLite, Pydantic |
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Framer Motion, React Query |
| Runtime | Python 3.13, Node.js |

## Quick Start

```bash
# 1. Clone
git clone <repo-url> skypulse && cd skypulse

# 2. Backend setup
cd backend
python3.13 -m venv env
source env/bin/activate
pip install -r requirements.txt

# 3. Frontend setup
cd ../frontend
npm install

# 4. Run both
cd ..
./start.sh
```

Backend runs on http://localhost:8000, frontend on http://localhost:3000.

## Project Structure

```
skypulse/
├── start.sh                          # Launches both servers
├── backend/
│   ├── main.py                       # FastAPI app, CORS, lifespan
│   ├── config.py                     # Paths, env vars, defaults
│   ├── models.py                     # Pydantic schemas
│   ├── watchlist.py                  # JSON file CRUD (thread-safe)
│   ├── price_history.py              # SQLite init, insert, query
│   ├── flight_checker.py             # swoop.search() wrapper, date range iteration
│   ├── google_flights_url.py         # TFSData-based deep link builder
│   ├── ws_handler.py                 # WebSocket endpoint, streaming, deal alerts
│   ├── routers/
│   │   └── flights.py                # REST CRUD + price history endpoints
│   ├── requirements.txt
│   └── data/                         # Auto-created: watchlist.json, skypulse.db
│
└── frontend/
    ├── app/
    │   ├── layout.tsx                # Root layout, Inter font, providers
    │   ├── page.tsx                  # Dashboard — wires all state + WebSocket
    │   ├── globals.css               # Tailwind v4, dark theme, shimmer
    │   └── providers.tsx             # React Query provider
    ├── components/
    │   ├── dashboard/                # FlightCard, FlightCardExpanded, FlightGrid, Header, EmptyState
    │   ├── forms/                    # AddFlightModal (add + edit), AirportInput
    │   ├── results/                  # TripOptionRow, LegDetail, BookNowButton
    │   ├── charts/                   # PriceSparkline (SVG, no lib)
    │   ├── alerts/                   # DealAlert, Confetti (canvas particles)
    │   └── ui/                       # GlassCard, AnimatedPrice, PulsingDot, GradientMesh, Modal, PlaneIcon
    ├── hooks/
    │   ├── useWebSocket.ts           # Auto-reconnect with exponential backoff
    │   ├── useFlights.ts             # React Query CRUD mutations
    │   ├── usePriceHistory.ts
    │   ├── useDealAlert.ts           # Alert state + audio notification
    │   └── useAutoRefresh.ts         # Configurable interval polling with countdown
    └── lib/
        ├── types.ts                  # TS types mirroring backend models
        ├── api.ts                    # Fetch wrappers
        ├── constants.ts              # API_BASE, WS_URL
        └── format.ts                 # Price/date/duration formatters
```

## API

### REST

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights` | List all watches |
| POST | `/api/flights` | Create a watch |
| GET | `/api/flights/:id` | Get one watch |
| PATCH | `/api/flights/:id` | Update a watch |
| DELETE | `/api/flights/:id` | Delete a watch |
| GET | `/api/flights/:id/history` | Price history (last 20) |

### WebSocket (`/ws`)

**Client → Server:**
```json
{ "type": "check_all" }
{ "type": "check_one", "id": "uuid" }
```

**Server → Client (streamed per-flight):**
```json
{ "type": "flight_status", "id": "uuid", "status": "checking" }
{ "type": "flight_result", "id": "uuid", "result": { ... } }
{ "type": "flight_error", "id": "uuid", "error": "..." }
{ "type": "deal_alert", "id": "uuid", "cheapest_price": 2941, "max_price": 5000, "message": "..." }
```

## Configuration

Environment variables (all optional):

| Variable | Default | Description |
|----------|---------|-------------|
| `SKYPULSE_HOST` | `127.0.0.1` | Backend bind address |
| `SKYPULSE_PORT` | `8000` | Backend port |
| `SKYPULSE_FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Frontend API base |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000/ws` | Frontend WebSocket URL |

## Data Storage

- **Watchlist**: `backend/data/watchlist.json` — JSON file, thread-safe with `threading.Lock`
- **Price history**: `backend/data/skypulse.db` — SQLite, indexed by `(flight_id, checked_at DESC)`
- Both auto-created on first startup
