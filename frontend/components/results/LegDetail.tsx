"use client";

import Image from "next/image";
import type { FlightLeg } from "@/lib/types";

interface LegDetailProps {
  leg: FlightLeg;
  compact?: boolean;
}

const stopsBadge = (isNonstop: boolean) =>
  isNonstop
    ? "bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]"
    : "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]";

export default function LegDetail({ leg, compact = false }: LegDetailProps) {
  const stopsLabel = leg.stops ?? "Nonstop";
  const isNonstop =
    !leg.stops ||
    leg.stops === "0" ||
    leg.stops.toLowerCase().includes("nonstop");

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--text-tertiary)] truncate max-w-[5rem]">
          {leg.airline ?? "Unknown"}
        </span>
        <span className="text-[var(--text-primary)] font-medium tabular-nums">
          {leg.departure_time ?? "--:--"}
        </span>
        <span className="text-[var(--text-faint)]">→</span>
        <span className="text-[var(--text-primary)] font-medium tabular-nums">
          {leg.arrival_time ?? "--:--"}
        </span>
        {leg.duration && (
          <span className="text-[var(--text-muted)]">{leg.duration}</span>
        )}
        <span className={`rounded-full px-1.5 py-px text-[9px] font-semibold ${stopsBadge(isNonstop)}`}>
          {stopsLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Airline */}
      <div className="flex w-24 shrink-0 items-center gap-2">
        {leg.airline_logo_url ? (
          <Image
            src={leg.airline_logo_url}
            alt={leg.airline ?? "Airline"}
            width={20}
            height={20}
            className="rounded-sm"
            unoptimized
          />
        ) : null}
        <span className="truncate text-xs text-[var(--text-tertiary)]">
          {leg.airline ?? "Unknown"}
        </span>
      </div>

      {/* Times */}
      <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
        <span className="font-medium tabular-nums">
          {leg.departure_time ?? "--:--"}
        </span>
        <span className="text-[var(--text-faint)]">→</span>
        <span className="font-medium tabular-nums">
          {leg.arrival_time ?? "--:--"}
        </span>
      </div>

      {/* Duration */}
      <span className="text-xs text-[var(--text-muted)]">{leg.duration ?? "--"}</span>

      {/* Stops */}
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stopsBadge(isNonstop)}`}>
        {stopsLabel}
      </span>
    </div>
  );
}
