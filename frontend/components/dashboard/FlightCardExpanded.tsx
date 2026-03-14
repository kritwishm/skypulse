"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plane, X } from "lucide-react";
import AnimatedPrice from "@/components/ui/AnimatedPrice";
import TripOptionRow from "@/components/results/TripOptionRow";
import { formatDate, formatPrice } from "@/lib/format";
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
                     rounded-t-2xl sm:rounded-2xl border border-slate-700/40
                     bg-[#131b2e]/95 backdrop-blur-xl shadow-2xl shadow-black/40"
        >
          {/* Drag handle — mobile only */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-600/60" />
          </div>

          {/* ── Sticky header ── */}
          <div className="shrink-0 px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-700/30">
            {/* Route + close */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-100">
                  {flight.origin}
                </span>
                <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400/70 rotate-[-30deg]" />
                <span className="text-2xl sm:text-3xl font-bold text-slate-100">
                  {flight.destination}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Meta tags */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-500 flex-wrap mb-3 sm:mb-4">
              <span className="px-1.5 py-0.5 rounded bg-slate-800/60">
                {formatDate(flight.departure_date)}
                {flight.departure_date_end && ` – ${formatDate(flight.departure_date_end)}`}
              </span>
              {flight.return_date && (
                <>
                  <span className="text-slate-600">↩</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/60">
                    {formatDate(flight.return_date)}
                    {flight.return_date_end && ` – ${formatDate(flight.return_date_end)}`}
                  </span>
                </>
              )}
              <span className="px-1.5 py-0.5 rounded bg-slate-800/60">
                {flight.trip_type === "round-trip" ? "Round trip" : "One way"}
              </span>
            </div>

            {/* Price summary — 2x2 grid on mobile, row on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-baseline gap-x-4 gap-y-2 sm:gap-6">
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mb-0.5 sm:mb-1">Cheapest</p>
                <AnimatedPrice
                  value={result.cheapest_price}
                  currency={flight.currency}
                  className="text-xl sm:text-2xl font-bold text-slate-50"
                />
                {result.cheapest_date && flight.departure_date_end && (
                  <p className="text-[10px] sm:text-[11px] text-blue-400/70 mt-0.5">
                    on {formatDate(result.cheapest_date)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mb-0.5 sm:mb-1">Range</p>
                <p className="text-xs sm:text-sm text-slate-400 tabular-nums">
                  {formatPrice(result.price_range.low, flight.currency)} &ndash;{" "}
                  {formatPrice(result.price_range.high, flight.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mb-0.5 sm:mb-1">Options</p>
                <p className="text-xs sm:text-sm text-slate-400">{result.result_count}</p>
              </div>
              {flight.max_price != null && flight.max_price > 0 && (
                <div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mb-0.5 sm:mb-1">Budget</p>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {formatPrice(flight.max_price, flight.currency)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 sm:mb-3">
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
