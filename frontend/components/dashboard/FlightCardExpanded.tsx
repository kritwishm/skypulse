"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, X } from "lucide-react";
import AnimatedPrice from "@/components/ui/AnimatedPrice";
import TripOptionRow from "@/components/results/TripOptionRow";
import { formatDate, formatPrice } from "@/lib/format";
import { getAirport } from "@/lib/getAirport";
import type {
  FlightWatch,
  FlightCheckResult,
} from "@/lib/types";

interface FlightCardExpandedProps {
  flight: FlightWatch;
  result: FlightCheckResult;
  onClose: () => void;
}

export default function FlightCardExpanded({
  flight,
  result,
  onClose,
}: FlightCardExpandedProps) {
  const originAirport = getAirport(flight.origin);
  const destAirport = getAirport(flight.destination);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal — full height on mobile, constrained on desktop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="relative z-10 flex flex-col w-full max-h-[95vh] sm:max-h-[90vh] sm:max-w-2xl
                     rounded-t-2xl sm:rounded-2xl border border-card
                     bg-card-alpha backdrop-blur-xl shadow-2xl shadow-black/40 transition-colors duration-300"
        >
          {/* Drag handle — mobile only */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/60" />
          </div>

          {/* ── Sticky header ── */}
          <div className="shrink-0 px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-card">
            {/* Route + close */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {flight.origin}
                  </span>
                  {originAirport && (
                    <span className="text-[11px] sm:text-xs text-tertiary leading-tight">
                      {originAirport.city}
                    </span>
                  )}
                </div>
                <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--accent)] rotate-[-30deg]" />
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {flight.destination}
                  </span>
                  {destAirport && (
                    <span className="text-[11px] sm:text-xs text-tertiary leading-tight">
                      {destAirport.city}
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg text-tertiary hover:text-primary hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Meta tags */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-tertiary flex-wrap mb-3 sm:mb-4">
              <span className="px-1.5 py-0.5 rounded bg-surface">
                {formatDate(flight.departure_date)}
                {flight.departure_date_end && ` – ${formatDate(flight.departure_date_end)}`}
              </span>
              {flight.return_date && (
                <>
                  <span className="text-muted">↩</span>
                  <span className="px-1.5 py-0.5 rounded bg-surface">
                    {formatDate(flight.return_date)}
                    {flight.return_date_end && ` – ${formatDate(flight.return_date_end)}`}
                  </span>
                </>
              )}
              <span className="px-1.5 py-0.5 rounded bg-surface">
                {flight.trip_type === "round-trip" ? "Round trip" : "One way"}
              </span>
            </div>

            {/* Price summary — 2x2 grid on mobile, row on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-baseline gap-x-4 gap-y-2 sm:gap-6">
              <div>
                <p className="text-[10px] sm:text-[11px] text-tertiary mb-0.5 sm:mb-1">Cheapest</p>
                <AnimatedPrice
                  value={result.cheapest_price}
                  currency={flight.currency}
                  className="text-xl sm:text-2xl font-bold text-primary"
                />
                {result.cheapest_date && flight.departure_date_end && (
                  <p className="text-[10px] sm:text-[11px] text-[var(--accent)] mt-0.5">
                    on {formatDate(result.cheapest_date)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-tertiary mb-0.5 sm:mb-1">Range</p>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] tabular-nums">
                  {formatPrice(result.price_range.low, flight.currency)} &ndash;{" "}
                  {formatPrice(result.price_range.high, flight.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-tertiary mb-0.5 sm:mb-1">Options</p>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{result.result_count}</p>
              </div>
              {flight.max_price != null && flight.max_price > 0 && (
                <div>
                  <p className="text-[10px] sm:text-[11px] text-tertiary mb-0.5 sm:mb-1">Budget</p>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    {formatPrice(flight.max_price, flight.currency)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-[10px] sm:text-xs font-medium text-tertiary uppercase tracking-wider mb-2 sm:mb-3">
              All Options ({result.result_count})
            </h3>
            <div className="space-y-2 pb-1">
              {result.results.map((tripResult, idx) => (
                <TripOptionRow
                  key={idx}
                  result={tripResult}
                  rank={idx + 1}
                  currency={flight.currency}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
