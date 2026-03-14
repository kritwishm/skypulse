import { getToken, clearToken } from "./auth";
import { API_BASE } from "./constants";
import type {
  FlightWatch,
  FlightWatchCreate,
  PriceHistoryEntry,
} from "./types";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    let message: string;
    try {
      const body = await response.json();
      message = body.detail || body.message || response.statusText;
    } catch {
      message = response.statusText;
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function fetchFlights(): Promise<FlightWatch[]> {
  return request<FlightWatch[]>("/api/flights/");
}

export async function createFlight(
  data: FlightWatchCreate,
): Promise<FlightWatch> {
  return request<FlightWatch>("/api/flights/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFlight(
  id: string,
  data: Partial<FlightWatchCreate>,
): Promise<FlightWatch> {
  return request<FlightWatch>(`/api/flights/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFlight(id: string): Promise<void> {
  return request<void>(`/api/flights/${id}`, {
    method: "DELETE",
  });
}

export async function fetchPriceHistory(
  id: string,
): Promise<PriceHistoryEntry[]> {
  return request<PriceHistoryEntry[]>(`/api/flights/${id}/history`);
}
