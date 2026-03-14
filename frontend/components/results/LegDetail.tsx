"use client";

import Image from "next/image";
import type { FlightLeg } from "@/lib/types";

interface LegDetailProps {
  leg: FlightLeg;
  compact?: boolean;
}

export default function LegDetail({ leg, compact = false }: LegDetailProps) {
  const stopsLabel = leg.stops ?? "Nonstop";
  const isNonstop =
    !leg.stops ||
    leg.stops === "0" ||
    leg.stops.toLowerCase().includes("nonstop");

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/60 truncate max-w-[5rem]">
          {leg.airline ?? "Unknown"}
        </span>
        <span className="text-white/80 tabular-nums">
          {leg.departure_time ?? "--:--"}
        </span>
        <span className="text-white/30">→</span>
        <span className="text-white/80 tabular-nums">
          {leg.arrival_time ?? "--:--"}
        </span>
        {leg.duration && (
          <span className="text-white/40">{leg.duration}</span>
        )}
        <span
          className={`rounded-full px-1.5 py-px text-[9px] font-medium ${
            isNonstop
              ? "bg-green-500/10 text-green-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
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
        <span className="truncate text-xs text-white/60">
          {leg.airline ?? "Unknown"}
        </span>
      </div>

      {/* Times */}
      <div className="flex items-center gap-1.5 text-white/80">
        <span className="font-medium tabular-nums">
          {leg.departure_time ?? "--:--"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 text-white/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <span className="font-medium tabular-nums">
          {leg.arrival_time ?? "--:--"}
        </span>
      </div>

      {/* Duration */}
      <span className="text-xs text-white/40">{leg.duration ?? "--"}</span>

      {/* Stops */}
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
          isNonstop
            ? "bg-green-500/10 text-green-400"
            : "bg-amber-500/10 text-amber-400"
        }`}
      >
        {stopsLabel}
      </span>
    </div>
  );
}
