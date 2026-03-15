# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Overview

SkyPulse is a flight price tracker web app. FastAPI backend scrapes Google Flights via `swoop-flights`, streams results over WebSocket. Next.js frontend renders a dark-themed dashboard with real-time price updates, deal alerts, and price history charts.

## Architecture

```
Browser  ←→  Next.js (3000)  ←→  FastAPI (8000)  ←→  Google Flights (via swoop)
                                      ↕
                              SQLite + JSON file
```

- **Backend** (`backend/`): FastAPI, Python 3.13, venv at `backend/env/`
- **Frontend** (`frontend/`): Next.js 16, React 19, Tailwind v4, Framer Motion
- **No external DB** — SQLite for price history, JSON file for watchlist

## Key Files

### Backend

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, lifespan (init DB on startup) |
| `models.py` | All Pydantic schemas: FlightWatch, FlightWatchCreate, FlightWatchUpdate, FlightResult, FlightCheckResult, PriceHistoryEntry |
| `flight_checker.py` | Core logic: iterates date ranges, calls `swoop.search()`, post-filters by stop count, aggregates results |
| `ws_handler.py` | WebSocket handler: `check_all`/`check_one` messages, concurrent checks via `asyncio.Semaphore(3)`, `_safe_send()` guards against disconnected clients |
| `watchlist.py` | Thread-safe JSON CRUD with `threading.Lock` |
| `price_history.py` | SQLite table + index, `record_price()`, `get_history()` |
| `google_flights_url.py` | Builds deep-link URLs using `TFSData.as_b64()` from swoop |
| `routers/flights.py` | REST: GET/POST/PATCH/DELETE `/api/flights`, GET `/api/flights/:id/history` |
| `config.py` | `DATA_DIR`, `WATCHLIST_FILE`, `DATABASE_FILE`, env var overrides |

### Frontend

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard, wires WebSocket messages → state → components |
| `hooks/useWebSocket.ts` | Auto-reconnect with exponential backoff (1s → 30s max) |
| `hooks/useAutoRefresh.ts` | Configurable interval (5/10/15/30 min) with live countdown |
| `hooks/useFlights.ts` | React Query: `useFlights`, `useCreateFlight`, `useUpdateFlight`, `useDeleteFlight` |
| `hooks/useDealAlert.ts` | Alert state + audio notification + 8s auto-dismiss |
| `components/dashboard/FlightCard.tsx` | Main card: route, meta tags, animated price, airline/duration, price range bar, budget meter, sparkline |
| `components/dashboard/FlightCardExpanded.tsx` | Modal overlay: sticky header + scrollable options list |
| `components/forms/AddFlightModal.tsx` | Slide-over form: add/edit mode, date ranges, stops toggle, currency, budget |
| `lib/types.ts` | TypeScript interfaces mirroring backend Pydantic models |
| `lib/api.ts` | Fetch wrappers with `ApiError` class |

## Working With the Codebase

### Running

```bash
./start.sh                    # Both servers (uses backend/env venv)
# Or individually:
cd backend && source env/bin/activate && uvicorn main:app --reload
cd frontend && npm run dev
```

### swoop-flights API

The backend uses `swoop-flights` (PyPI), imported as `from swoop import search`. Key points:

- `search(origin, destination, date, *, return_date=None, max_stops=None, ...)` returns a `SearchResult`
- `SearchResult.results` is a list of `TripOption` with `.price` (int), `.legs` (list of `TripLeg`), `.selector` (str)
- Each `TripLeg` has `.itinerary` (may be None) with `.airline_names`, `.departure_time` (tuple), `.arrival_time` (tuple), `.travel_time` (int minutes), `.stop_count` (int)
- `max_stops` is an upper bound (0=nonstop, 1=one-or-fewer), so we post-filter in `flight_checker.py` for exact stop counts
- Price is always an integer (no currency symbol parsing needed)
- Google Flights deep links use `TFSData.from_interface().as_b64()` from `swoop.builders`

### Date Range Searches

When `departure_date_end` is set, `flight_checker.py` iterates each date in the range (capped at 15 days), calls `search()` for each, and aggregates all results. For round trips with `return_date_end`, it generates all valid (departure, return) combos where return > departure.

### WebSocket Protocol

All sends go through `_safe_send()` which checks `ws.client_state` before sending — prevents crashes when client disconnects during a long check. Persistence (watchlist update, price history write) happens regardless of client state.

### Frontend State Flow

1. `useWebSocket` connects to `/ws`, dispatches incoming messages via `onMessage` callback
2. `page.tsx` maps message types to state: `flight_status` → `checkingIds` set, `flight_result` → `flightResults` map, `deal_alert` → `useDealAlert`
3. Cards read from both `flightResults` (live) and `flight.cheapest_price` (persisted) for last-known fallback
4. `useAutoRefresh` fires `handleCheckAll` at the configured interval

### Design System

The app supports **dark and light themes** via CSS custom properties defined in `globals.css`. Theme is toggled via `data-theme` attribute on `<html>` and managed by `ThemeContext`.

**CRITICAL: Never hardcode colors.** Always use CSS variable utility classes or `var(--token)` syntax:
- Page background: `bg-page` (not `bg-[#0c1120]`)
- Card surfaces: `bg-card`, `bg-card-alpha` (not `bg-[#131b2e]`)
- Elevated surfaces: `bg-elevated` (not `bg-[#1a2540]`)
- Subtle surfaces: `bg-surface` (not `bg-slate-800/60`)
- Inputs: `bg-input`, `border-input` (not `bg-slate-800/40 border-slate-700/50`)
- Borders: `border-card` (not `border-slate-700/40`)
- Text primary: `text-primary` (not `text-slate-100`)
- Text secondary: `text-[var(--text-secondary)]` (not `text-slate-300`)
- Text muted: `text-tertiary` / `text-muted` / `text-faint` (not `text-slate-500/600/700`)
- Accent colors (`blue-*`, `emerald-*`, `red-*`) are fine as-is — they work in both themes
- All components use Tailwind utility classes — no CSS modules, no styled-components

### Important Patterns

- **Editing flights**: The form modal serves both add and edit. When editing, it pre-fills from the flight object. On submit for one-way, it explicitly sends `null` for return date fields so the PATCH clears them.
- **Stop filtering**: `max_stops` in swoop is "up to N stops". We pass it to narrow Google's search, then post-filter in Python to keep only results with exactly N stops.
- **Card click**: The entire FlightCard is clickable (expands). Footer action buttons call `e.stopPropagation()` to prevent expand when clicking check/edit/delete. If dates are expired, card click opens edit instead of expand.
- **Concurrent checks**: `asyncio.Semaphore(3)` caps parallel flight searches. Each check runs `swoop.search()` in a thread via `asyncio.to_thread()`.
- **Expired dates**: If a flight's departure date range is in the past, the card shows a warning banner and only allows edit/delete — no check or expand. Clicking the card opens edit mode directly.

### Design Mentality (apply everywhere)

- **Every interactive element must have `cursor-pointer`** and visible hover/tap feedback (scale, color change, or glow). If it's clickable, the user must know.
- **Selected/active states must be high-contrast** — use solid `var(--accent)` with white text for toggles/tabs, not faint translucent backgrounds like `bg-blue-500/15`.
- **Badges and status pills must be readable in both themes** — use CSS variable badge tokens (`--badge-green-bg`, `--badge-green-text`, etc.), never hardcoded `text-green-400` which washes out in light mode.
- **Form validation should prevent illogical input** — no past dates in date pickers (`min` attr), disable dependent fields until prerequisites are filled, enforce max ranges.
- **Empty/zero states should be meaningful** — never show ₹0 or "0 options". Show "No flights found" or "Not checked yet" with appropriate icons.
- **Dark and light themes are first-class citizens** — every UI change must be verified in both themes. Use CSS variable tokens for all colors.

### What NOT to Do

- **Don't hardcode colors** — never use hex colors (`#0c1120`, `#131b2e`) or hardcoded Tailwind slate colors (`text-slate-100`, `bg-slate-800/60`). Always use CSS variable tokens (`text-primary`, `bg-card`, `bg-surface`, etc.) so both themes work.
- **Don't hardcode backend config** — never hardcode URLs, secrets, ports, or database paths. Always use environment variables with sensible defaults in `config.py`.
- Don't use `fast_flights` — the package is `swoop-flights`, imported as `from swoop import search`
- Don't use `datetime.utcnow()` — use `datetime.now(timezone.utc)` everywhere
- Don't add `indigo` or `purple` colors — the palette is blue (`blue-*`) + accent (`emerald-*`, `red-*`)
- Don't use `layoutId` for card ↔ expanded transitions — it causes text stretching. The expanded view uses a clean scale+fade modal animation instead.
