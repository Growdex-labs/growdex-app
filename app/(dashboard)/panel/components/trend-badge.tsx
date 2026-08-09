"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * For cost metrics such as CPC and CPA a fall is an improvement, so the arrow
 * follows the movement while the colour follows whether that movement helps.
 */
export type TrendGoodDirection = "up" | "down";

interface TrendBadgeProps {
  trend: number;
  goodDirection?: TrendGoodDirection;
  className?: string;
  iconClassName?: string;
}

export function TrendBadge({
  trend,
  goodDirection = "up",
  className = "text-sm font-gilroy-regular",
  iconClassName = "w-5 h-5",
}: TrendBadgeProps) {
  if (!Number.isFinite(trend) || trend === 0) return null;

  const rising = trend > 0;
  const isGood = rising === (goodDirection === "up");
  const Icon = rising ? TrendingUp : TrendingDown;

  return (
    <div
      className={`flex items-center gap-1 ${
        isGood ? "text-emerald-600" : "text-firebrick-500"
      }`}
      title={`${rising ? "Up" : "Down"} ${Math.abs(trend)}% versus the previous period`}
    >
      <span className={className}>{Math.abs(trend)}%</span>
      <Icon className={iconClassName} aria-hidden />
      <span className="sr-only">
        {rising ? "increased" : "decreased"} by {Math.abs(trend)} percent
      </span>
    </div>
  );
}
