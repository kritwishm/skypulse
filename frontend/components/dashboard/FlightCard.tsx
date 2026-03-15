"use client";

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
import { getAirport } from "@/lib/getAirport";
import type {
  FlightWatch,
  FlightCheckResult,
} from "@/lib/types";

interface FlightCardProps {
  flight: FlightWatch;
  result: FlightCheckResult | null;
  isChecking: boolean;
  onCheck: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onExpand: () => void;
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
}: FlightCardProps) {
  const hasResults = result != null && result.result_count > 0;
  const cheapest = hasResults ? result.results[0] : undefined;
  const cheapestLeg = cheapest?.legs?.[0];
  const currentPrice = hasResults ? result.cheapest_price : flight.cheapest_price;

  const hasBudget = flight.max_price != null && flight.max_price > 0;
  const hasDeal =
    hasBudget &&
    currentPrice != null &&
    currentPrice > 0 &&
    currentPrice <= flight.max_price!;
  const budgetDiff =
    hasBudget && currentPrice != null && currentPrice > 0
      ? flight.max_price! - currentPrice
      : null;
  const isOverBudget = budgetDiff !== null && budgetDiff < 0;

  const originAirport = getAirport(flight.origin);
  const destAirport = getAirport(flight.destination);

  const lastDate = flight.departure_date_end || flight.departure_date;
  const isExpired = lastDate < new Date().toISOString().split("T")[0];

  return (
    <motion.div variants={itemVariants} layout>
      <GlassCard
        className="p-3.5 sm:p-5 cursor-pointer"
        borderColor={hasDeal ? "emerald" : isOverBudget ? "red" : undefined}
        onClick={isExpired ? onEdit : onExpand}
        hover
      >
        {/* Route header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary tracking-wide">
                {flight.origin}
              </span>
              {originAirport && (
                <span className="text-[10px] sm:text-[11px] text-tertiary leading-tight">
                  {originAirport.city}
                </span>
              )}
            </div>
            <Plane className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--accent)]/60 rotate-[-30deg]" />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary tracking-wide">
                {flight.destination}
              </span>
              {destAirport && (
                <span className="text-[10px] sm:text-[11px] text-tertiary leading-tight">
                  {destAirport.city}
                </span>
              )}
            </div>
          </div>
          {isChecking && <PulsingDot color="yellow" size="md" />}
          {!isChecking && hasDeal && (
            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-medium">
              <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Deal
            </span>
          )}
        </div>

        {/* Expired dates warning */}
        {isExpired && (
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Dates passed — tap to update
            </span>
          </div>
        )}

        {/* Meta tags */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-tertiary mb-3 sm:mb-4 flex-wrap">
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
          <span className="px-1.5 py-0.5 rounded bg-surface">
            {stopsLabel(flight.max_stops)}
          </span>
        </div>

        {/* Price area */}
        <div className="mb-3 sm:mb-4">
          {isChecking ? (
            <div className="space-y-2">
              <div className="h-7 sm:h-8 w-32 sm:w-36 mx-auto rounded-lg shimmer" />
              <div className="h-3 w-40 sm:w-48 mx-auto rounded shimmer" />
              <div className="h-9 sm:h-10 w-full rounded-lg shimmer mt-2" />
            </div>
          ) : result && !hasResults ? (
            <div className="flex flex-col items-center gap-1 py-2 sm:py-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-faint" />
              <p className="text-xs sm:text-sm text-muted">No flights found</p>
            </div>
          ) : hasResults ? (
            <div>
              {/* Cheapest price */}
              <div className="text-center mb-1.5 sm:mb-2">
                <AnimatedPrice
                  value={result.cheapest_price}
                  currency={flight.currency}
                  className="text-2xl sm:text-3xl font-bold text-primary"
                />
              </div>

              {/* Best date callout */}
              {result.cheapest_date && flight.departure_date_end && (
                <p className="text-center text-[11px] sm:text-xs text-[var(--accent)] mb-1">
                  Best on {formatDate(result.cheapest_date)}
                  {cheapest?.return_date && ` · return ${formatDate(cheapest.return_date)}`}
                </p>
              )}

              {/* Best option detail */}
              {cheapestLeg && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-tertiary mb-2 sm:mb-3">
                  {cheapestLeg.airline && (
                    <span className="text-[var(--text-secondary)] font-medium">
                      {cheapestLeg.airline}
                    </span>
                  )}
                  {cheapestLeg.duration && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {cheapestLeg.duration}
                    </span>
                  )}
                  {cheapestLeg.stops && (
                    <span className="px-1.5 py-0.5 rounded bg-surface">
                      {cheapestLeg.stops}
                    </span>
                  )}
                </div>
              )}

              {/* Price range bar */}
              <div className="rounded-lg bg-[var(--bg-surface)] p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                  <span className="text-tertiary">
                    {formatPrice(result.price_range.low, flight.currency)}
                  </span>
                  <span className="text-muted">
                    {result.result_count} option{result.result_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-tertiary">
                    {formatPrice(result.price_range.high, flight.currency)}
                  </span>
                </div>
                <div className="relative h-1 sm:h-1.5 rounded-full bg-[var(--border-card)] overflow-hidden">
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
                <div className="mt-1.5 sm:mt-2 rounded-lg bg-[var(--bg-surface)] px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-tertiary">
                    Budget: {formatPrice(flight.max_price!, flight.currency)}
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold ${
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
              <span className="text-xl sm:text-2xl font-bold text-[var(--text-secondary)] tabular-nums">
                {formatPrice(flight.cheapest_price, flight.currency)}
              </span>
              <p className="text-[11px] sm:text-xs text-muted mt-1">Last known price</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2 sm:py-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-faint" />
              <p className="text-xs sm:text-sm text-muted">Not checked yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="flex items-center justify-between border-t border-card pt-2.5 sm:pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5">
            {!isExpired && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCheck}
                disabled={isChecking}
                className="p-1.5 sm:p-2 rounded-lg text-tertiary hover:text-blue-400 hover:bg-blue-500/10
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Check now"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isChecking ? "animate-spin" : ""}`}
                />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-1.5 sm:p-2 rounded-lg text-muted hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]
                         transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-1.5 sm:p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10
                         transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {flight.last_checked && (
              <span className="text-[9px] sm:text-[10px] text-muted" title={flight.last_checked}>
                {formatDateTime(flight.last_checked)}
              </span>
            )}
            <MousePointerClick className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-faint" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
