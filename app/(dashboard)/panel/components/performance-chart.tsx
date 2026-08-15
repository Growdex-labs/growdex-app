"use client";

import { MoreVertical } from "lucide-react";
import { MetaIcon, PlatformMark } from "./platform-icons";

export interface SpendPoint {
  date: string;
  meta: number;
  tiktok: number;
}

interface PerformanceChartProps {
  data: SpendPoint[];
  totalSpent: string;
  /** Set when spend spans several currencies, where one bar scale cannot hold. */
  unplottableReason?: string;
}

const Y_AXIS_STEPS = 5;

const formatAxisValue = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function PerformanceChart({
  data,
  totalSpent,
  unplottableReason,
}: PerformanceChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.meta, d.tiktok]));
  const axisLabels = Array.from({ length: Y_AXIS_STEPS }, (_, index) =>
    formatAxisValue((maxValue / Y_AXIS_STEPS) * (Y_AXIS_STEPS - index)),
  );

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-lavender-100 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-gilroy-bold text-sm tracking-[-0.14px] text-[#333]">
          Lifetime Ad Spend
        </h3>
        <button
          className="text-lavender-200 hover:text-[#333]"
          aria-label="Chart options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-8 rounded-xl bg-lavender-25 p-4">
        <h1 className="font-lexend text-2xl md:text-[28px] text-[#333]">
          {totalSpent}
        </h1>

        {unplottableReason ? (
          <p className="font-gilroy-regular text-sm tracking-[-0.14px] text-bodySecondary">
            {unplottableReason}
          </p>
        ) : data.length === 0 ? (
          <p className="font-gilroy-regular text-sm tracking-[-0.14px] text-bodySecondary">
            No spend recorded yet.
          </p>
        ) : (
          <div className="flex gap-4">
            {/* Y axis labels */}
            <div className="flex flex-col justify-between font-gilroy-light text-[10px] md:text-xs tracking-[-0.12px] text-lavender-200 text-right pb-[70px] pt-1 shrink-0">
              {axisLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            {/* Groups */}
            <div className="flex-1 flex justify-between gap-4 md:gap-8 overflow-x-auto hide-scrollbar">
              {data.map((item) => (
                <div
                  key={item.date}
                  className="flex-1 min-w-[70px] flex flex-col items-stretch"
                >
                  {/* Bars */}
                  <div className="flex items-end justify-center gap-2 md:gap-3 h-[220px]">
                    <div
                      className="flex-1 bg-khaki-200 rounded-2xl"
                      style={{ height: `${(item.meta / maxValue) * 100}%` }}
                    />
                    <div
                      className="flex-1 bg-black-800 rounded-2xl"
                      style={{ height: `${(item.tiktok / maxValue) * 100}%` }}
                    />
                  </div>

                  {/* Platform icons pill */}
                  <div className="flex items-center justify-center gap-6 px-3 py-3 rounded-full">
                    <MetaIcon className="size-4" />
                    <PlatformMark platform="tiktok" />
                  </div>

                  {/* Date pill */}
                  <div className="bg-lavender-50 rounded-xl py-1.5 px-2 text-center">
                    <span className="font-gilroy-light text-[10px] md:text-xs tracking-[-0.12px] text-lavender-200">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
