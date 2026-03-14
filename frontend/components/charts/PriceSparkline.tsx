"use client";

import { useMemo } from "react";
import type { PriceHistoryEntry } from "@/lib/types";

interface PriceSparklineProps {
  data: PriceHistoryEntry[];
  width?: number;
  height?: number;
  className?: string;
}

export default function PriceSparkline({
  data,
  width = 120,
  height = 40,
  className,
}: PriceSparklineProps) {
  const { linePath, areaPath, minPoint, maxPoint } = useMemo(() => {
    if (data.length === 0) {
      return { linePath: "", areaPath: "", minPoint: null, maxPoint: null };
    }

    const sorted = [...data].sort(
      (a, b) =>
        new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
    );

    const prices = sorted.map((d) => d.cheapest);
    const padding = 4;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const points = sorted.map((d, i) => ({
      x: padding + (sorted.length === 1 ? w / 2 : (i / (sorted.length - 1)) * w),
      y: padding + h - ((d.cheapest - minPrice) / priceRange) * h,
      price: d.cheapest,
    }));

    // Single data point: flat line
    if (points.length === 1) {
      const p = points[0];
      const flatY = padding + h / 2;
      return {
        linePath: `M ${padding},${flatY} L ${width - padding},${flatY}`,
        areaPath: `M ${padding},${flatY} L ${width - padding},${flatY} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`,
        minPoint: { x: p.x, y: flatY },
        maxPoint: { x: p.x, y: flatY },
      };
    }

    // Build smooth path using quadratic bezier curves
    let line = `M ${points[0].x},${points[0].y}`;

    if (points.length === 2) {
      line += ` L ${points[1].x},${points[1].y}`;
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;

        if (i === 0) {
          line += ` Q ${curr.x},${curr.y} ${midX},${midY}`;
        } else {
          line += ` Q ${curr.x},${curr.y} ${midX},${midY}`;
        }

        if (i === points.length - 2) {
          line += ` Q ${next.x},${next.y} ${next.x},${next.y}`;
        }
      }
    }

    // Area path: line path + close at bottom
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const area = `${line} L ${lastPoint.x},${height - padding} L ${firstPoint.x},${height - padding} Z`;

    // Find min and max points
    let minIdx = 0;
    let maxIdx = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].price < points[minIdx].price) minIdx = i;
      if (points[i].price > points[maxIdx].price) maxIdx = i;
    }

    return {
      linePath: line,
      areaPath: area,
      minPoint: points[minIdx],
      maxPoint: points[maxIdx],
    };
  }, [data, width, height]);

  if (data.length === 0) return null;

  const gradientId = `sparkline-gradient-${useMemo(() => Math.random().toString(36).slice(2, 9), [])}`;
  const areaGradientId = `${gradientId}-area`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${areaGradientId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Min dot */}
      {minPoint && (
        <circle
          cx={minPoint.x}
          cy={minPoint.y}
          r={2.5}
          fill="#22c55e"
          stroke="#15803d"
          strokeWidth={0.5}
        />
      )}

      {/* Max dot */}
      {maxPoint && minPoint !== maxPoint && (
        <circle
          cx={maxPoint.x}
          cy={maxPoint.y}
          r={2.5}
          fill="#ef4444"
          stroke="#b91c1c"
          strokeWidth={0.5}
        />
      )}
    </svg>
  );
}
