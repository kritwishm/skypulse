// Auth
export interface UserPublic {
  id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

// Flights
export interface FlightWatch {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  departure_date_end: string | null;
  return_date: string | null;
  return_date_end: string | null;
  trip_type: "one-way" | "round-trip";
  currency: string;
  max_price: number | null;
  max_stops: number | null;
  created_at: string;
  last_checked: string | null;
  cheapest_price: number | null;
  cheapest_date: string | null;
  status: string;
}

export interface FlightWatchCreate {
  origin: string;
  destination: string;
  departure_date: string;
  departure_date_end?: string | null;
  return_date?: string | null;
  return_date_end?: string | null;
  trip_type: "one-way" | "round-trip";
  currency: string;
  max_price?: number | null;
  max_stops?: number | null;
}

export interface FlightLeg {
  departure_time: string | null;
  arrival_time: string | null;
  duration: string | null;
  stops: string | null;
  airline: string | null;
  airline_logo_url: string | null;
}

export interface FlightResult {
  price: number;
  departure_date: string | null;
  return_date: string | null;
  legs: FlightLeg[];
  google_flights_url: string | null;
}

export interface FlightCheckResult {
  cheapest_price: number;
  cheapest_date: string | null;
  price_range: { low: number; high: number };
  result_count: number;
  results: FlightResult[];
  checked_at: string;
}

export interface PriceHistoryEntry {
  id: number;
  flight_id: string;
  cheapest: number;
  low: number | null;
  high: number | null;
  result_count: number;
  checked_at: string;
}

// WebSocket message types
export type WSIncoming =
  | { type: "connected"; watchlist_count: number }
  | { type: "flight_status"; id: string; status: string }
  | { type: "flight_result"; id: string; result: FlightCheckResult }
  | { type: "flight_error"; id: string; error: string }
  | {
      type: "deal_alert";
      id: string;
      cheapest_price: number;
      max_price: number;
      message: string;
    }
  | { type: "check_all_complete"; count: number }
  | { type: "error"; error: string };

export type WSOutgoing =
  | { type: "check_all" }
  | { type: "check_one"; id: string };
