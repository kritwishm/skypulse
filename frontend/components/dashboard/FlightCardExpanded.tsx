"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plane, X } from "lucide-react";
import dynamic from "next/dynamic";
import AnimatedPrice from "@/components/ui/AnimatedPrice";
import TripOptionRow from "@/components/results/TripOptionRow";
import { formatDate, formatPrice } from "@/lib/format";
import type {
  FlightWatch,
  FlightCheckResult,
  PriceHistoryEntry,
} from "@/lib/types";

const PriceSparkline = dynamic(
  () => import("@/components/charts/PriceSparkline"),
  { ssr: false }
);

interface FlightCardExpandedProps {
  flight: FlightWatch;
  result: FlightCheckResult;
  onClose: () => void;
  priceHistory: PriceHistoryEntry[];
}

export default function FlightCardExpanded({
  flight,
  result,
  onClose,
  priceHistory,
}: FlightCardExpandedProps) {
  return (
    <AnimatePresence>
      {/* Full-screen overlay — flex center, no scroll on outer */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal — constrained to viewport, internal scroll */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="relative z-10 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-700/40 bg-[#131b2e]/95 backdrop-blur-xl shadow-2xl shadow-black/40"
        >
          {/* ── Sticky header ── */}
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-700/30">
            {/* Route + close */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-slate-100">
                  {flight.origin}
                </span>
                <Plane className="h-5 w-5 text-blue-400/70 rotate-[-30deg]" />
                <span className="text-3xl font-bold text-slate-100">
                  {flight.destination}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Meta tags */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap mb-4">
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

            {/* Price summary row */}
            <div className="flex flex-wrap items-baseline gap-6">
              <div>
                <p className="text-[11px] text-slate-500 mb-1">Cheapest</p>
                <AnimatedPrice
                  value={result.cheapest_price}
                  currency={flight.currency}
                  className="text-2xl font-bold text-slate-50"
                />
                {result.cheapest_date && flight.departure_date_end && (
                  <p className="text-[11px] text-blue-400/70 mt-0.5">
                    on {formatDate(result.cheapest_date)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-slate-500 mb-1">Range</p>
                <p className="text-sm text-slate-400 tabular-nums">
                  {formatPrice(result.price_range.low, flight.currency)} &ndash;{" "}
                  {formatPrice(result.price_range.high, flight.currency)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 mb-1">Options</p>
                <p className="text-sm text-slate-400">{result.result_count}</p>
              </div>
              {flight.max_price != null && flight.max_price > 0 && (
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Budget</p>
                  <p className="text-sm text-slate-400">
                    {formatPrice(flight.max_price, flight.currency)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
            {/* Sparkline */}
            {priceHistory.length > 1 && (
              <div className="mb-5 h-20">
                <PriceSparkline data={priceHistory} height={80} />
              </div>
            )}

            {/* Trip options list */}
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
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
