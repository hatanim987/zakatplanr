"use client";

import type { HawlStatus } from "@/lib/hawl";

const SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const statusColors: Record<HawlStatus, string> = {
  idle: "stroke-gray-400",
  tracking: "stroke-blue-600",
  due: "stroke-amber-600",
  paid: "stroke-green-600",
  reset: "stroke-gray-400",
};

export function HawlProgressRing({
  percent,
  daysElapsed,
  totalDays,
  status,
}: {
  percent: number;
  daysElapsed: number;
  totalDays: number;
  status: HawlStatus;
}) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  const colorClass = statusColors[status];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-muted/20"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${colorClass} transition-all duration-500`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{daysElapsed}</span>
        <span className="text-xs text-muted-foreground">of {totalDays} days</span>
      </div>
    </div>
  );
}
