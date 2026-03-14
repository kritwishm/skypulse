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
      className={`flex items-center gap-4 rounded-xl border border-slate-700/20 px-4 py-3
                  ${isEven ? "bg-slate-800/20" : "bg-slate-800/40"}
                  transition-colors hover:bg-slate-800/60`}
    >
      {/* Left: Rank & Price */}
      <div className="flex shrink-0 flex-col items-center gap-1 w-20">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-400">
          #{rank}
        </span>
        <span className="text-base font-bold text-white tabular-nums">
          {formatPrice(result.price, currency)}
        </span>
        {result.departure_date && (
          <span className="text-[10px] text-slate-500">
            {formatDate(result.departure_date)}
          </span>
        )}
      </div>

      {/* Middle: Leg details */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {result.legs.map((leg, i) => (
          <LegDetail key={i} leg={leg} />
        ))}
      </div>

      {/* Right: Book button */}
      <div className="shrink-0">
        <BookNowButton url={result.google_flights_url} />
      </div>
    </motion.div>
  );
}
