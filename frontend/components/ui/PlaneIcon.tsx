"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface PlaneIconProps {
  className?: string;
  animate?: boolean;
}

export default function PlaneIcon({
  className,
  animate: shouldAnimate = false,
}: PlaneIconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx("h-5 w-5 text-white/60", className)}
      animate={
        shouldAnimate
          ? { x: [0, 4, 0] }
          : undefined
      }
      transition={
        shouldAnimate
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <path d="M21.71 11.29l-9-9a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42l.71.71L12 4.41l9 9 .71-.71a1 1 0 000-1.41z" fill="none" />
      <path d="M2.5 12.5L12 3l1.5 1.5L5 13H10l3-3 8.5 2.5-1 1L14 12l-3 3H7.5l-1.5 1.5L4 14.5H1l1.5-2z" fill="none" />
      <path d="M22 11.5L12.5 9 9 12.5H6.5L4 15l3.5-1 3-3 6.5 2 2-1.5zM2 12l2.5-2L8 9l4-4 1.5.5-3 3.5L5 11l-3 1z" fill="none" />
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </motion.svg>
  );
}
