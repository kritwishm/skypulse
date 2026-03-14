"use client";

import clsx from "clsx";

interface PulsingDotProps {
  color?: "green" | "yellow" | "red";
  size?: "sm" | "md";
}

const colorMap = {
  green: {
    dot: "bg-green-500",
    ring: "bg-green-400",
  },
  yellow: {
    dot: "bg-yellow-500",
    ring: "bg-yellow-400",
  },
  red: {
    dot: "bg-red-500",
    ring: "bg-red-400",
  },
};

const sizeMap = {
  sm: {
    container: "h-2.5 w-2.5",
    dot: "h-2 w-2",
    ring: "h-2.5 w-2.5",
  },
  md: {
    container: "h-3.5 w-3.5",
    dot: "h-3 w-3",
    ring: "h-3.5 w-3.5",
  },
};

export default function PulsingDot({
  color = "green",
  size = "sm",
}: PulsingDotProps) {
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <span className={clsx("relative inline-flex", sizes.container)}>
      <span
        className={clsx(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          colors.ring
        )}
      />
      <span
        className={clsx(
          "relative inline-flex rounded-full",
          sizes.dot,
          colors.dot
        )}
      />
    </span>
  );
}
