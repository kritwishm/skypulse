"use client";

import { motion } from "framer-motion";
import type { FlightResult } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";
import LegDetail from "@/components/results/LegDetail";
import BookNowButton from "@/components/results/BookNowButton";

interface TripOptionRowProps {
  result: FlightResult;
  rank: number;
  currency: string;
}

export default function TripOptionRow({
  result,
  rank,
  currency,
}: TripOptionRowProps) {
  const isEven = rank % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.3 }}
      className={`rounded-xl border border-card px-3 sm:px-4 py-2.5 sm:py-3
                  ${isEven ? "bg-[var(--bg-surface)]/50" : "bg-surface"}
                  transition-colors duration-300 hover:bg-[var(--bg-elevated)]`}
    >
      {/* Mobile: stacked layout */}
      <div className="sm:hidden">
        {/* Top row: rank + price + date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-[9px] font-bold text-[var(--badge-blue-rank)]">
              #{rank}
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {formatPrice(result.price, currency)}
            </span>
            {result.departure_date && (
              <span className="text-[10px] text-tertiary">
                {formatDate(result.departure_date)}
              </span>
            )}
          </div>
          <BookNowButton url={result.google_flights_url} />
        </div>
        {/* Legs */}
        <div className="flex flex-col gap-1.5">
          {result.legs.map((leg, i) => (
            <LegDetail key={i} leg={leg} compact />
          ))}
        </div>
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1 w-20">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-[10px] font-bold text-[var(--badge-blue-rank)]">
            #{rank}
          </span>
          <span className="text-base font-bold text-primary tabular-nums">
            {formatPrice(result.price, currency)}
          </span>
          {result.departure_date && (
            <span className="text-[10px] text-tertiary">
              {formatDate(result.departure_date)}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {result.legs.map((leg, i) => (
            <LegDetail key={i} leg={leg} />
          ))}
        </div>
        <div className="shrink-0">
          <BookNowButton url={result.google_flights_url} />
        </div>
      </div>
    </motion.div>
  );
}
