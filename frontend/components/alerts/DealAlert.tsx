"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Plane, ArrowDown } from "lucide-react";
import Confetti from "./Confetti";

interface DealAlertProps {
  isVisible: boolean;
  message: string;
  cheapestPrice: number;
  maxPrice: number;
  currency: string;
  onDismiss: () => void;
}

export default function DealAlert({
  isVisible,
  message,
  cheapestPrice,
  maxPrice,
  currency,
  onDismiss,
}: DealAlertProps) {
  const savings = maxPrice - cheapestPrice;
  const savingsPercent = maxPrice > 0 ? Math.round((savings / maxPrice) * 100) : 0;

  // Parse route from message like "Deal found! BLR -> GOX at 2941 (target: 5000)"
  const routeMatch = message.match(/([A-Z]{3})\s*->\s*([A-Z]{3})/);
  const origin = routeMatch?.[1] ?? "";
  const destination = routeMatch?.[2] ?? "";

  return (
    <>
      <Confetti isActive={isVisible} />

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Mobile: full-width bottom sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="sm:hidden fixed inset-x-0 bottom-0 z-50 p-3"
            >
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0a1628]/98 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
                {/* Animated gradient border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-400/5" />
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/8 blur-3xl" />

                <div className="relative p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15"
                      >
                        <ArrowDown className="h-4 w-4 text-emerald-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-sm font-bold text-emerald-300">Price Drop!</h3>
                        {origin && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs font-semibold text-slate-300">{origin}</span>
                            <Plane className="h-2.5 w-2.5 text-emerald-500/60 rotate-[-30deg]" />
                            <span className="text-xs font-semibold text-slate-300">{destination}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onDismiss}
                      className="p-1 rounded-lg text-slate-500 active:bg-slate-700/50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price row */}
                  <div className="flex items-end justify-between rounded-xl bg-emerald-500/[0.07] border border-emerald-500/10 px-3.5 py-2.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-emerald-500/60 mb-0.5">Found at</p>
                      <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="text-2xl font-black tabular-nums text-emerald-400"
                      >
                        {currency === "INR" ? "₹" : currency}{cheapestPrice.toLocaleString()}
                      </motion.p>
                    </div>
                    {savings > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest text-emerald-500/60 mb-0.5">You save</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold tabular-nums text-white">
                            {currency === "INR" ? "₹" : currency}{savings.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400/80">
                            {savingsPercent}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Desktop: floating card */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="hidden sm:block fixed bottom-6 right-6 z-50 w-[340px]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0a1628]/98 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
                {/* Glow effects */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-400/5" />
                <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/8 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />

                <div className="relative p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15"
                      >
                        <ArrowDown className="h-5 w-5 text-emerald-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-base font-bold text-emerald-300">Price Drop!</h3>
                        {origin && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-semibold text-slate-300">{origin}</span>
                            <Plane className="h-3 w-3 text-emerald-500/60 rotate-[-30deg]" />
                            <span className="text-sm font-semibold text-slate-300">{destination}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onDismiss}
                      className="p-1.5 rounded-lg text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price display */}
                  <div className="flex items-end justify-between rounded-xl bg-emerald-500/[0.07] border border-emerald-500/10 px-4 py-3.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-emerald-500/60 mb-1">Found at</p>
                      <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="text-3xl font-black tabular-nums text-emerald-400"
                      >
                        {currency === "INR" ? "₹" : currency}{cheapestPrice.toLocaleString()}
                      </motion.p>
                    </div>
                    {savings > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-emerald-500/60 mb-1">You save</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold tabular-nums text-white">
                            {currency === "INR" ? "₹" : currency}{savings.toLocaleString()}
                          </span>
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm font-semibold text-emerald-400/80"
                          >
                            {savingsPercent}%
                          </motion.span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Budget context */}
                  <p className="mt-3 text-[11px] text-slate-500 text-center">
                    Budget was {currency === "INR" ? "₹" : currency}{maxPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
