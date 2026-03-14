"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";
import clsx from "clsx";

interface AnimatedPriceProps {
  value: number;
  currency?: string;
  className?: string;
}

const currencySymbols: Record<string, string> = {
  INR: "\u20B9",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
};

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

export default function AnimatedPrice({
  value,
  currency = "INR",
  className,
}: AnimatedPriceProps) {
  const motionValue = useMotionValue(0);
  const displayed = useTransform(motionValue, (latest) => formatNumber(latest));
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = displayed.on("change", (v) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = `${currencySymbols[currency] ?? currency} ${v}`;
      }
    });
    return unsubscribe;
  }, [displayed, currency]);

  const symbol = currencySymbols[currency] ?? currency;

  return (
    <motion.span ref={nodeRef} className={clsx("tabular-nums", className)}>
      {symbol} 0
    </motion.span>
  );
}
