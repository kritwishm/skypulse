"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Plus, RefreshCw, Timer, ChevronDown } from "lucide-react";
import PulsingDot from "@/components/ui/PulsingDot";
import type { RefreshInterval } from "@/hooks/useAutoRefresh";

interface DashboardHeaderProps {
  onAddFlight: () => void;
  onCheckAll: () => void;
  isChecking: boolean;
  flightCount: number;
  isConnected: boolean;
  refreshInterval: RefreshInterval;
  onSetRefreshInterval: (mins: RefreshInterval) => void;
  refreshSecondsLeft: number;
}

const INTERVALS: { value: RefreshInterval; label: string }[] = [
  { value: 0, label: "Off" },
  { value: 1, label: "1m" },
  { value: 5, label: "5m" },
  { value: 10, label: "10m" },
  { value: 15, label: "15m" },
  { value: 30, label: "30m" },
];

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function DashboardHeader({
  onAddFlight,
  onCheckAll,
  isChecking,
  flightCount,
  isConnected,
  refreshInterval,
  onSetRefreshInterval,
  refreshSecondsLeft,
}: DashboardHeaderProps) {
  const [showRefreshMenu, setShowRefreshMenu] = useState(false);
  const isAutoRefreshOn = refreshInterval > 0;

  return (
    <header className="flex items-center justify-between">
      {/* Title + connection (mobile) */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 rotate-[-30deg]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
          SkyPulse
        </h1>
        {/* Mobile connection dot — inline with title */}
        <div className="flex sm:hidden items-center gap-1.5">
          <PulsingDot color={isConnected ? "green" : "red"} size="sm" />
          <span className="text-[11px] text-slate-500">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Desktop controls — hidden on mobile (FAB handles it) */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex items-center gap-2 mr-1">
          <PulsingDot color={isConnected ? "green" : "red"} size="sm" />
          <span className="text-xs text-slate-500">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>

        {/* Auto-refresh control */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowRefreshMenu((p) => !p)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium rounded-lg sm:rounded-xl border transition-all duration-200 ${
              isAutoRefreshOn
                ? "text-blue-400 bg-blue-500/10 border-blue-500/25"
                : "text-slate-400 bg-slate-800/60 border-slate-700/50"
            }`}
          >
            <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {isAutoRefreshOn ? (
              <span className="tabular-nums">{formatCountdown(refreshSecondsLeft)}</span>
            ) : (
              <span>Auto</span>
            )}
            <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </motion.button>

          <AnimatePresence>
            {showRefreshMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRefreshMenu(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-50 w-40 sm:w-44 rounded-xl border border-slate-700/40 bg-[#131b2e] p-1.5 shadow-xl shadow-black/30"
                >
                  <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Auto-refresh
                  </p>
                  {INTERVALS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onSetRefreshInterval(opt.value);
                        setShowRefreshMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        refreshInterval === opt.value
                          ? "bg-blue-500/15 text-blue-300"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                      }`}
                    >
                      <span>{opt.value === 0 ? "Off" : `Every ${opt.value} min`}</span>
                      {refreshInterval === opt.value && (
                        <span className="text-blue-400 text-xs">●</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Check All */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onCheckAll}
          disabled={isChecking || flightCount === 0}
          className="relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium
                     text-slate-300 bg-slate-800/60 border border-slate-700/50 rounded-lg sm:rounded-xl
                     hover:bg-slate-800 hover:border-slate-600/50 hover:text-slate-200
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <RefreshCw
            className={`h-3 w-3 sm:h-4 sm:w-4 ${isChecking ? "animate-spin" : ""}`}
          />
          <span className="hidden xs:inline">Check All</span>
          <span className="xs:hidden">Check</span>
          {flightCount > 0 && (
            <span className="flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-blue-500/15 px-1 sm:px-1.5 text-[10px] sm:text-xs text-blue-400 font-medium">
              {flightCount}
            </span>
          )}
        </motion.button>

        {/* Add Flight */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAddFlight}
          className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-white
                     bg-blue-600 rounded-lg sm:rounded-xl
                     hover:bg-blue-500
                     transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Add Flight</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </div>
    </header>
  );
}
