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
    boxShadow: "0 0 20px rgba(16, 185, 129, 0.06), var(--card-shadow)",
  },
  red: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    boxShadow: "0 0 20px rgba(239, 68, 68, 0.06), var(--card-shadow)",
  },
  default: {
    borderColor: "var(--border-card)",
    boxShadow: "var(--card-shadow)",
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
        "rounded-2xl border bg-card-alpha backdrop-blur-xl transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      animate={animateStyle}
      whileHover={
        hover
          ? {
              scale: 1.012,
              boxShadow: borderColor
                ? `${animateStyle.boxShadow.replace("var(--card-shadow)", "")}, var(--card-shadow-hover)`
                : "var(--card-shadow-hover)",
              borderColor: borderColor
                ? animateStyle.borderColor
                : "var(--border-card-hover)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
