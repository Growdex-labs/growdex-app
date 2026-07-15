"use client";

import { MoreVertical } from "lucide-react";
import { PlatformIconRow } from "./platform-icons";

interface ChartDataPoint {
  date: string;
  facebook: number;
  instagram: number;
  tiktok: number;
}

interface PerformanceChartProps {
  data?: ChartDataPoint[];
  totalSpent: string;
}

const SAMPLE_DATA: ChartDataPoint[] = [
  { date: "21/09/2025", facebook: 2500, instagram: 5100, tiktok: 7200 },
  { date: "21/09/2025", facebook: 6100, instagram: 3250, tiktok: 2750 },
  { date: "21/09/2025", facebook: 4000, instagram: 7200, tiktok: 4400 },
  { date: "21/09/2025", facebook: 4650, instagram: 7600, tiktok: 8500 },
  { date: "21/09/2025", facebook: 12500, instagram: 4700, tiktok: 3700 },
];

const Y_LABELS = ["14,500.00", "12,500.00", "10,000.00", "7,500.00", "2,5000"];

export function PerformanceChart({ data, totalSpent }: PerformanceChartProps) {
  const chartData = data && data.length > 0 ? data : SAMPLE_DATA;
  const maxValue = Math.max(
    1,
    ...chartData.flatMap((d) => [d.facebook, d.instagram, d.tiktok])
  );

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-[#4d4d4d] font-gilroy-regular">
          Total amount spent
        </h3>
        <button
          className="text-gray-400 hover:text-gray-600"
          aria-label="Chart options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <h1 className="text-2xl md:text-[28px] text-gray-800 font-gilroy-semibold mb-6 md:mb-8">
        {totalSpent}
      </h1>

      <div className="flex gap-4">
        {/* Y axis labels */}
        <div className="flex flex-col justify-between text-[10px] md:text-xs text-[#9095a7] font-gilroy-light text-right pb-[70px] pt-1 shrink-0">
          {Y_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        {/* Groups */}
        <div className="flex-1 flex justify-between gap-4 md:gap-8 overflow-x-auto hide-scrollbar">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 min-w-[70px] flex flex-col items-stretch">
              {/* Bars */}
              <div className="flex items-end justify-center gap-2 md:gap-3 h-[220px]">
                <div
                  className="flex-1 bg-khaki-200 rounded-2xl"
                  style={{ height: `${(item.facebook / maxValue) * 100}%` }}
                />
                <div
                  className="flex-1 bg-peru-200 rounded-2xl"
                  style={{ height: `${(item.instagram / maxValue) * 100}%` }}
                />
                <div
                  className="flex-1 bg-black-800 rounded-2xl"
                  style={{ height: `${(item.tiktok / maxValue) * 100}%` }}
                />
              </div>

              {/* Platform icons pill */}
              <div className="flex items-center justify-center px-3 py-3 rounded-full">
                <PlatformIconRow />
              </div>

              {/* Date pill */}
              <div className="bg-lavender-50 rounded-xl py-1.5 px-2 text-center">
                <span className="text-[10px] md:text-xs text-[#9095a7] font-gilroy-light">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
