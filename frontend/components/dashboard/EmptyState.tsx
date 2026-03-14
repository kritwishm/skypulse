"use client";

import { motion } from "framer-motion";
import { Plane, Plus } from "lucide-react";

interface EmptyStateProps {
  onAddFlight: () => void;
}

export default function EmptyState({ onAddFlight }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/50 border border-slate-700/30">
        <Plane className="h-10 w-10 text-slate-600 rotate-[-30deg]" />
      </div>

      <h2 className="text-lg font-semibold text-slate-300 mb-2">
        No flights tracked yet
      </h2>

      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        Add your first flight to start tracking prices in real-time
      </p>

      <motion.button
        whileHover={{
          scale: 1.04,
          boxShadow: "0 0 24px rgba(59, 130, 246, 0.25)",
        }}
        whileTap={{ scale: 0.96 }}
        onClick={onAddFlight}
        className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white
                   bg-blue-600 rounded-xl
                   hover:bg-blue-500
                   transition-all duration-200"
      >
        <Plus className="h-4 w-4" />
        Add Flight
      </motion.button>
    </motion.div>
  );
}
