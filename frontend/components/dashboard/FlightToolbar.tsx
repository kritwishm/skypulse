"use client";

import { Search, X, Plane, TrendingDown, AlertCircle } from "lucide-react";
import { getAirport } from "@/lib/getAirport";
import type { FlightWatch, FlightCheckResult } from "@/lib/types";

interface FlightToolbarProps {
  flights: FlightWatch[];
  flightResults: Record<string, FlightCheckResult>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
}

export default function FlightToolbar({
  flights,
  flightResults,
  searchQuery,
  onSearchChange,
  filteredCount,
}: FlightToolbarProps) {
  const today = new Date().toISOString().split("T")[0];

  const totalWatches = flights.length;
  const expiredCount = flights.filter((f) => {
    const lastDate = f.departure_date_end || f.departure_date;
    return lastDate < today;
  }).length;
  const activeDeals = flights.filter((f) => {
    const result = flightResults[f.id];
    return (
      f.max_price != null &&
      f.max_price > 0 &&
      result &&
      result.cheapest_price > 0 &&
      result.cheapest_price <= f.max_price
    );
  }).length;

  const isFiltering = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search routes, cities..."
          className="w-full rounded-lg border border-card bg-card pl-9 pr-8 py-2
                     text-sm text-primary placeholder-[var(--text-muted)]
                     outline-none transition-colors
                     focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded
                       text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
        {isFiltering ? (
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Plane className="h-3 w-3 text-blue-400 rotate-[-30deg]" />
            <span className="tabular-nums font-medium">
              {filteredCount} of {totalWatches}
            </span>
            <span className="text-tertiary">matches</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Plane className="h-3 w-3 text-blue-400 rotate-[-30deg]" />
            <span className="tabular-nums font-medium">{totalWatches}</span>
            <span className="text-tertiary">{totalWatches === 1 ? "watch" : "watches"}</span>
          </span>
        )}
        {activeDeals > 0 && (
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingDown className="h-3 w-3" />
            <span className="tabular-nums font-medium">{activeDeals}</span>
            <span className="hidden sm:inline text-emerald-400/70">{activeDeals === 1 ? "deal" : "deals"}</span>
          </span>
        )}
        {expiredCount > 0 && (
          <span className="flex items-center gap-1 text-amber-400">
            <AlertCircle className="h-3 w-3" />
            <span className="tabular-nums font-medium">{expiredCount}</span>
            <span className="hidden sm:inline text-amber-400/70">expired</span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Filter flights by search query — matches against IATA codes, city names,
 * and country names for both origin and destination.
 */
export function filterFlights(flights: FlightWatch[], query: string): FlightWatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return flights;

  return flights.filter((f) => {
    const originAirport = getAirport(f.origin);
    const destAirport = getAirport(f.destination);

    const searchable = [
      f.origin,
      f.destination,
      originAirport?.city,
      originAirport?.name,
      originAirport?.country,
      destAirport?.city,
      destAirport?.name,
      destAirport?.country,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(q);
  });
}
