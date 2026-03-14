"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className,
  onClick,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={clsx(
        "rounded-2xl border border-slate-700/40 bg-[#131b2e]/80 backdrop-blur-xl",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      whileHover={
        hover
          ? {
              scale: 1.015,
              boxShadow: "0 0 32px rgba(59, 130, 246, 0.08), 0 8px 32px rgba(0,0,0,0.3)",
              borderColor: "rgba(100, 116, 139, 0.35)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
