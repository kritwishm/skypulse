"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Timer, X } from "lucide-react";
import type { RefreshInterval } from "@/hooks/useAutoRefresh";

interface MobileFABProps {
  onAddFlight: () => void;
  onCheckAll: () => void;
  isChecking: boolean;
  flightCount: number;
  isConnected: boolean;
  refreshInterval: RefreshInterval;
  onSetRefreshInterval: (mins: RefreshInterval) => void;
  refreshSecondsLeft: number;
}

const INTERVALS: RefreshInterval[] = [0, 1, 5, 10, 15, 30];

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.05, type: "spring" as const, damping: 20, stiffness: 350 },
  }),
  exit: { opacity: 0, scale: 0.6, y: 10, transition: { duration: 0.15 } },
};

export default function MobileFAB({
  onAddFlight,
  onCheckAll,
  isChecking,
  flightCount,
  refreshInterval,
  onSetRefreshInterval,
  refreshSecondsLeft,
}: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const isAutoRefreshOn = refreshInterval > 0;

  const close = () => { setIsOpen(false); setShowTimerPicker(false); };

  return (
    <div className="sm:hidden fixed bottom-5 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30"
              onClick={close}
            />

            {/* Timer picker — appears to the left */}
            <AnimatePresence>
              {showTimerPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 8 }}
                  className="absolute bottom-[8.5rem] right-14 rounded-xl border border-slate-700/50 bg-[#131b2e] p-1 shadow-xl shadow-black/40"
                >
                  <div className="flex gap-0.5">
                    {INTERVALS.map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          onSetRefreshInterval(val);
                          setShowTimerPicker(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          refreshInterval === val
                            ? "bg-blue-500/20 text-blue-300"
                            : "text-slate-400 active:bg-slate-800"
                        }`}
                      >
                        {val === 0 ? "Off" : `${val}m`}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2">
              {/* Auto-refresh */}
              <motion.button
                custom={2}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowTimerPicker((p) => !p)}
                className={`flex items-center gap-1.5 h-10 pl-3 pr-3.5 rounded-full shadow-lg shadow-black/30 border text-xs font-medium ${
                  isAutoRefreshOn
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                    : "bg-[#1a2540] border-slate-700/50 text-slate-400"
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                {isAutoRefreshOn ? formatCountdown(refreshSecondsLeft) : "Auto"}
              </motion.button>

              {/* Check All */}
              <motion.button
                custom={1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileTap={{ scale: 0.92 }}
                onClick={() => { close(); onCheckAll(); }}
                disabled={isChecking || flightCount === 0}
                className="flex items-center gap-1.5 h-10 pl-3 pr-3.5 rounded-full
                           bg-[#1a2540] border border-slate-700/50 shadow-lg shadow-black/30
                           text-slate-300 text-xs font-medium
                           disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
                Check
                {flightCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500/20 px-1 text-[10px] text-blue-400">
                    {flightCount}
                  </span>
                )}
              </motion.button>

              {/* Add Flight */}
              <motion.button
                custom={0}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileTap={{ scale: 0.92 }}
                onClick={() => { close(); onAddFlight(); }}
                className="flex items-center gap-1.5 h-10 pl-3 pr-3.5 rounded-full
                           bg-blue-600 shadow-lg shadow-blue-500/25
                           text-white text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </motion.button>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => { setIsOpen((p) => !p); setShowTimerPicker(false); }}
        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          isOpen
            ? "bg-slate-700/90 shadow-black/30"
            : "bg-blue-600 shadow-blue-500/30"
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 300 }}
        >
          {isOpen ? (
            <X className="h-4.5 w-4.5 text-white" />
          ) : (
            <Plus className="h-5 w-5 text-white" />
          )}
        </motion.div>

        {/* Auto-refresh ping indicator */}
        {!isOpen && isAutoRefreshOn && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border border-blue-400/50" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
