"use client";

import { AnimatePresence, motion } from "framer-motion";
import Confetti from "./Confetti";

interface DealAlertProps {
  isVisible: boolean;
  message: string;
  cheapestPrice: number;
  maxPrice: number;
  currency: string;
  onDismiss: () => void;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
    </svg>
  );
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

  return (
    <>
      <Confetti isActive={isVisible} />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 80, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 80, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-40 w-80"
          >
            <div className="relative rounded-xl border border-emerald-500/40 bg-[#131b2e]/95 p-5 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
              {/* Dismiss button */}
              <button
                onClick={onDismiss}
                className="absolute right-3 top-3 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-slate-300"
                aria-label="Dismiss"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Heading */}
              <div className="mb-3 flex items-center gap-2">
                <SparkleIcon className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">
                  Deal Found!
                </h3>
              </div>

              {/* Message */}
              <p className="mb-4 text-sm leading-relaxed text-slate-400">
                {message}
              </p>

              {/* Price display */}
              <div className="flex items-end justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Cheapest
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {currency}
                    {cheapestPrice.toLocaleString()}
                  </p>
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Under budget by
                    </p>
                    <p className="text-lg font-semibold text-green-300">
                      {currency}
                      {savings.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Glow effect */}
              <div className="pointer-events-none absolute -inset-px -z-10 rounded-xl bg-gradient-to-b from-emerald-400/8 to-transparent blur-sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
