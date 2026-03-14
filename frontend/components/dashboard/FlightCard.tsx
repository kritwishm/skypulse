"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Plane,
  RefreshCw,
  Trash2,
  Pencil,
  Clock,
  TrendingDown,
  AlertCircle,
  MousePointerClick,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedPrice from "@/components/ui/AnimatedPrice";
import PulsingDot from "@/components/ui/PulsingDot";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import type {
  FlightWatch,
  FlightCheckResult,
  PriceHistoryEntry,
} from "@/lib/types";

const PriceSparkline = dynamic(
  () => import("@/components/charts/PriceSparkline"),
  { ssr: false }
);

interface FlightCardProps {
  flight: FlightWatch;
  result: FlightCheckResult | null;
  isChecking: boolean;
  onCheck: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onExpand: () => void;
  priceHistory: PriceHistoryEntry[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

function stopsLabel(maxStops: number | null) {
  if (maxStops === null) return "Any stops";
  if (maxStops === 0) return "Nonstop";
  return `≤${maxStops} stop${maxStops > 1 ? "s" : ""}`;
}

export default function FlightCard({
  flight,
  result,
  isChecking,
  onCheck,
  onDelete,
  onEdit,
  onExpand,
  priceHistory,
}: FlightCardProps) {
  const hasDeal =
    flight.max_price != null &&
    flight.cheapest_price != null &&
    flight.cheapest_price > 0 &&
    flight.cheapest_price <= flight.max_price;

  const cheapest = result?.results?.[0];
  const cheapestLeg = cheapest?.legs?.[0];
  const currentPrice = result?.cheapest_price ?? flight.cheapest_price;

  const hasBudget = flight.max_price != null && flight.max_price > 0;
  const budgetDiff =
    hasBudget && currentPrice != null && currentPrice > 0
      ? flight.max_price! - currentPrice
      : null;

  return (
    <motion.div variants={itemVariants} layout>
      <GlassCard
        className={`p-5 cursor-pointer ${hasDeal ? "ring-1 ring-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.08)]" : ""}`}
        onClick={onExpand}
        hover
      >
        {/* Route header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-100 tracking-wide">
              {flight.origin}
            </span>
            <Plane className="h-4 w-4 text-blue-400/70 rotate-[-30deg]" />
            <span className="text-2xl font-bold text-slate-100 tracking-wide">
              {flight.destination}
            </span>
          </div>
          {isChecking && <PulsingDot color="yellow" size="md" />}
          {!isChecking && hasDeal && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              <TrendingDown className="h-3 w-3" />
              Deal
            </span>
          )}
        </div>

        {/* Meta tags */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 flex-wrap">
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
          <span className="px-1.5 py-0.5 rounded bg-slate-800/60">
            {stopsLabel(flight.max_stops)}
          </span>
        </div>

        {/* Price area */}
        <div className="mb-4">
          {isChecking ? (
            <div className="space-y-2">
              <div className="h-8 w-36 mx-auto rounded-lg shimmer" />
              <div className="h-3 w-48 mx-auto rounded shimmer" />
              <div className="h-10 w-full rounded-lg shimmer mt-2" />
            </div>
          ) : result ? (
            <div>
              {/* Cheapest price */}
              <div className="text-center mb-2">
                <AnimatedPrice
                  value={result.cheapest_price}
                  currency={flight.currency}
                  className="text-3xl font-bold text-slate-50"
                />
              </div>

              {/* Best date callout (for range searches) */}
              {result.cheapest_date && flight.departure_date_end && (
                <p className="text-center text-xs text-blue-400/80 mb-1">
                  Best on {formatDate(result.cheapest_date)}
                  {cheapest?.return_date && ` · return ${formatDate(cheapest.return_date)}`}
                </p>
              )}

              {/* Best option detail */}
              {cheapestLeg && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-3">
                  {cheapestLeg.airline && (
                    <span className="text-slate-400 font-medium">
                      {cheapestLeg.airline}
                    </span>
                  )}
                  {cheapestLeg.duration && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {cheapestLeg.duration}
                    </span>
                  )}
                  {cheapestLeg.stops && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/60">
                      {cheapestLeg.stops}
                    </span>
                  )}
                </div>
              )}

              {/* Price range bar */}
              <div className="rounded-lg bg-slate-800/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {formatPrice(result.price_range.low, flight.currency)}
                  </span>
                  <span className="text-slate-600">
                    {result.result_count} option{result.result_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-500">
                    {formatPrice(result.price_range.high, flight.currency)}
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
                  {result.price_range.high > result.price_range.low ? (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{
                        width: `${Math.max(
                          ((result.cheapest_price - result.price_range.low) /
                            (result.price_range.high - result.price_range.low)) *
                            100,
                          8
                        )}%`,
                      }}
                    />
                  ) : (
                    <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  )}
                </div>
              </div>

              {/* Budget meter */}
              {hasBudget && budgetDiff !== null && (
                <div className="mt-2 rounded-lg bg-slate-800/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Budget: {formatPrice(flight.max_price!, flight.currency)}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      budgetDiff >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {budgetDiff >= 0
                      ? `${formatPrice(budgetDiff, flight.currency)} under`
                      : `${formatPrice(Math.abs(budgetDiff), flight.currency)} over`}
                  </span>
                </div>
              )}
            </div>
          ) : flight.cheapest_price != null ? (
            <div className="text-center">
              <span className="text-2xl font-bold text-slate-400 tabular-nums">
                {formatPrice(flight.cheapest_price, flight.currency)}
              </span>
              <p className="text-xs text-slate-600 mt-1">Last known price</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-3">
              <AlertCircle className="h-5 w-5 text-slate-700" />
              <p className="text-sm text-slate-600">Not checked yet</p>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {priceHistory.length > 1 && (
          <div className="mb-3 h-10">
            <PriceSparkline data={priceHistory} height={40} />
          </div>
        )}

        {/* Footer */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="flex items-center justify-between border-t border-slate-700/30 pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCheck}
              disabled={isChecking}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Check now"
            >
              <RefreshCw
                className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700/40
                         transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10
                         transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            {flight.last_checked && (
              <span className="text-[10px] text-slate-600" title={flight.last_checked}>
                {formatDateTime(flight.last_checked)}
              </span>
            )}
            <MousePointerClick className="h-3.5 w-3.5 text-slate-700" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
