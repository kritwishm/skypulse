# SkyPulse Frontend

Next.js dashboard for tracking flight prices in real-time. Dark-themed UI with WebSocket-driven live updates, deal alerts with audio notifications, and price history sparklines.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion 12 |
| Data Fetching | TanStack React Query v5 |
| Real-time | WebSocket (native) |
| Icons | Lucide React |
| Utilities | clsx |

## Project Structure

```
frontend/
  app/
    layout.tsx                # Root layout with QueryClientProvider
    page.tsx                  # Main dashboard — wires WebSocket, state, and components
  hooks/
    useWebSocket.ts           # WebSocket with auto-reconnect (exponential backoff)
    useAutoRefresh.ts         # Configurable interval timer (1/5/10/15/30 min)
    useFlights.ts             # React Query hooks for CRUD operations
    useDealAlert.ts           # Alert state + audio notification + 8s auto-dismiss
    usePriceHistory.ts        # React Query hook for price history
  components/
    dashboard/
      DashboardHeader.tsx     # Title bar, connection status, refresh controls, action buttons
      FlightGrid.tsx          # Responsive grid layout for flight cards
      FlightCard.tsx          # Main card: route, meta tags, price, airline, sparkline
      FlightCardExpanded.tsx  # Modal overlay: sticky header + scrollable options list
      EmptyState.tsx          # Shown when no flights are tracked
    forms/
      AddFlightModal.tsx      # Slide-over form for add/edit flights
    alerts/
      DealAlert.tsx           # Animated deal notification banner
    ui/
      GradientMesh.tsx        # Background gradient decoration
      PulsingDot.tsx          # Connection status indicator
  lib/
    types.ts                  # TypeScript interfaces (mirrors backend Pydantic models)
    api.ts                    # Fetch wrappers with ApiError class
    constants.ts              # API_BASE and WS_URL
  public/
    sounds/
      deal-alert.mp3          # Audio notification for deal alerts
```

## Setup & Running

```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:3000

# Or from the project root:
./start.sh      # Starts both backend and frontend
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Architecture & State Flow

The app uses a hybrid data strategy: REST for CRUD persistence and WebSocket for real-time flight check results.

```
                         +-----------------+
                         |    page.tsx      |
                         |  (orchestrator)  |
                         +--------+--------+
                                  |
              +-------------------+-------------------+
              |                   |                   |
     useFlights()          useWebSocket()      useAutoRefresh()
     (React Query)         (live updates)      (periodic timer)
              |                   |                   |
     REST CRUD:            WS messages:         Fires check_all
     GET/POST/PATCH/       flight_status →      every N minutes
     DELETE flights        flight_result →
                           flight_error →
                           deal_alert →
                           check_all_complete →
```

### Message Flow

1. **`useWebSocket`** connects to `ws://localhost:8000/ws` and dispatches incoming messages via the `onMessage` callback
2. **`page.tsx`** maps message types to state updates:
   - `flight_status` (checking) → adds ID to `checkingIds` Set
   - `flight_result` → removes from `checkingIds`, stores result in `flightResults` map, triggers React Query refetch
   - `flight_error` → removes from `checkingIds`
   - `deal_alert` → triggers `useDealAlert` (banner + audio)
   - `check_all_complete` → clears `isCheckingAll`
3. **Cards** read from both `flightResults` (live) and `flight.cheapest_price` (persisted) for last-known fallback

## Key Components

### DashboardHeader

Top bar with:
- SkyPulse logo and title
- Connection status indicator (PulsingDot — green/red)
- Auto-refresh dropdown (Off / 1m / 5m / 10m / 15m / 30m) with live countdown
- "Check All" button with flight count badge
- "Add Flight" button

### FlightCard

The main card displaying a tracked flight. Shows:
- Route (origin → destination) with IATA codes
- Meta tags: trip type, dates, stop preference, currency
- Animated price display (current cheapest)
- Airline name and flight duration
- Price range bar (low to high)
- Budget meter (progress toward max_price)
- Sparkline chart from price history

The entire card is clickable to expand. Footer action buttons (check/edit/delete) use `e.stopPropagation()` to prevent expansion.

### FlightCardExpanded

Modal overlay with:
- Sticky header with route and price summary
- Scrollable list of all flight options from the last check
- Each option shows: price, airline, departure/arrival times, duration, stops, Google Flights link
- Close on backdrop click or X button
- Uses scale + fade animation (not `layoutId` — avoids text stretching)

### AddFlightModal

Slide-over form that serves both add and edit modes:
- Origin and destination airport codes
- Departure date (with optional range end)
- Return date fields (shown for round-trip)
- Trip type toggle (one-way / round-trip)
- Stops filter (Any / Nonstop / 1 Stop / 2 Stops)
- Currency selector
- Budget (max price) input
- On edit, pre-fills from flight object
- On submit for one-way, explicitly sends `null` for return date fields to clear them via PATCH

### DealAlert

Animated notification banner triggered when a flight price drops to or below budget:
- Slides in from top with spring animation
- Shows deal message, price found, and target budget
- Auto-dismisses after 8 seconds
- Manual dismiss button
- Plays `deal-alert.mp3` audio notification

## Custom Hooks

### useWebSocket

Auto-reconnecting WebSocket connection.

```typescript
const { isConnected, sendMessage, reconnect } = useWebSocket({ onMessage });
```

- Connects to `WS_URL` on mount
- **Exponential backoff** on disconnect: starts at 1s, doubles each retry, caps at 30s
- Resets delay on successful connection
- `sendMessage()` only sends if socket is in `OPEN` state
- `reconnect()` resets backoff and reconnects immediately
- Cleans up on unmount (nulls `onclose` to prevent reconnect, closes socket)
- Uses refs for callbacks to avoid stale closures

### useAutoRefresh

Configurable periodic refresh timer.

```typescript
const { interval, setInterval, isActive, secondsLeft } = useAutoRefresh(onRefresh);
```

- Options: Off (0) / 1 / 5 / 10 / 15 / 30 minutes
- Single countdown timer that fires `onRefresh` at zero and resets
- `secondsLeft` provides live countdown for the UI
- Cleans up interval on unmount

### useFlights

React Query hooks for flight CRUD.

```typescript
const { flights, isLoading, error, refetch } = useFlights();
const createFlight = useCreateFlight();
const updateFlight = useUpdateFlight();
const deleteFlight = useDeleteFlight();
```

- All mutations auto-invalidate the `["flights"]` query on success
- `useFlights()` returns `[]` as default when data is undefined
- Mutations return standard React Query mutation objects with `mutate()` / `mutateAsync()`

### useDealAlert

Deal notification state management + audio.

```typescript
const { showAlert, alertData, triggerAlert, dismissAlert } = useDealAlert();
```

- `triggerAlert()` sets alert data, shows banner, plays audio, and starts 8s auto-dismiss timer
- Audio plays at 0.6 volume; silently catches autoplay blocks
- `dismissAlert()` clears timer, hides banner, nulls data
- Cleans up timers on unmount

## Design System

Dark grey + blue palette with consistent Tailwind utility classes. No CSS modules or styled-components.

### Colors

| Usage | Value |
|-------|-------|
| Page background | `#0c1120` |
| Card surface | `#131b2e` |
| Card border | `border-slate-700/40` |
| Primary accent | `blue-500` / `blue-600` |
| Text (primary) | `slate-100` |
| Text (secondary) | `slate-300` |
| Text (muted) | `slate-500` |
| Text (faint) | `slate-600` |
| Deal/success state | `emerald-400` / `emerald-500` |

### Animation Patterns

All animations use Framer Motion:
- **Cards**: `whileHover` scale, `whileTap` scale
- **Modals**: `initial` + `animate` + `exit` with scale + fade
- **Alerts**: slide-in from top with spring physics
- **Buttons**: scale on hover/tap with box-shadow glow
- **Loading**: CSS spin animation on border element

## API Integration

### REST (lib/api.ts)

Generic `request<T>()` wrapper that:
- Prepends `API_BASE` to all paths
- Sets `Content-Type: application/json`
- Throws `ApiError` with status code and parsed error detail on non-OK responses
- Returns `undefined` for 204 responses

| Function | Method | Path |
|----------|--------|------|
| `fetchFlights()` | GET | `/api/flights` |
| `createFlight(data)` | POST | `/api/flights` |
| `updateFlight(id, data)` | PATCH | `/api/flights/{id}` |
| `deleteFlight(id)` | DELETE | `/api/flights/{id}` |
| `fetchPriceHistory(id)` | GET | `/api/flights/{id}/history` |

### WebSocket (lib/types.ts)

**Outgoing (client → server):**

| Type | Payload |
|------|---------|
| `check_all` | `{}` |
| `check_one` | `{ id: string }` |

**Incoming (server → client):**

| Type | Key Fields |
|------|------------|
| `connected` | `watchlist_count` |
| `flight_status` | `id`, `status` |
| `flight_result` | `id`, `result: FlightCheckResult` |
| `flight_error` | `id`, `error` |
| `deal_alert` | `id`, `cheapest_price`, `max_price`, `message` |
| `check_all_complete` | `count` |
| `error` | `error` |

## TypeScript Interfaces

All interfaces in `lib/types.ts` mirror the backend Pydantic models:

- **`FlightWatch`** — Full flight watch object with server fields (id, status, timestamps, cached price)
- **`FlightWatchCreate`** — Fields for creating/updating a flight watch
- **`FlightLeg`** — Single leg: airline, times, duration, stops
- **`FlightResult`** — One flight option: price, dates, legs, Google Flights URL
- **`FlightCheckResult`** — Aggregated check result: cheapest, range, all results
- **`PriceHistoryEntry`** — Historical price data point
- **`WSIncoming`** — Discriminated union of all server WebSocket message types
- **`WSOutgoing`** — Union of client WebSocket message types
