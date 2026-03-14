"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  borderColor?: "emerald" | "red";
}

const borderStyles = {
  emerald: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    boxShadow: "0 0 24px rgba(16, 185, 129, 0.08)",
  },
  red: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    boxShadow: "0 0 24px rgba(239, 68, 68, 0.08)",
  },
  default: {
    borderColor: "rgba(51, 65, 85, 0.4)",
    boxShadow: "none",
  },
};

export default function GlassCard({
  children,
  className,
  onClick,
  hover = true,
  borderColor,
}: GlassCardProps) {
  const animateStyle = borderColor
    ? borderStyles[borderColor]
    : borderStyles.default;

  return (
    <motion.div
      className={clsx(
        "rounded-2xl border bg-[#131b2e]/80 backdrop-blur-xl",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      animate={animateStyle}
      whileHover={
        hover
          ? {
              scale: 1.015,
              boxShadow: borderColor
                ? `${animateStyle.boxShadow}, 0 8px 32px rgba(0,0,0,0.3)`
                : "0 0 32px rgba(59, 130, 246, 0.08), 0 8px 32px rgba(0,0,0,0.3)",
              borderColor: borderColor
                ? animateStyle.borderColor
                : "rgba(100, 116, 139, 0.35)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
