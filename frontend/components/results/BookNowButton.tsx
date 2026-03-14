"use client";

import { motion } from "framer-motion";

interface BookNowButtonProps {
  url: string | null;
}

export default function BookNowButton({ url }: BookNowButtonProps) {
  const baseClasses =
    "inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap";

  if (!url) {
    return (
      <button
        disabled
        className={`${baseClasses} border-white/5 bg-white/5 text-white/20 cursor-not-allowed`}
      >
        Book Now
        <span className="text-[10px]">&nearr;</span>
      </button>
    );
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} border-blue-500/25 bg-blue-500/10
                  text-blue-400 hover:bg-blue-500/20 hover:text-blue-300
                  hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10`}
    >
      Book Now
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    </motion.a>
  );
}
