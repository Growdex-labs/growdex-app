"use client";

import React from "react";
import { Facebook, Instagram, MoreVertical } from "lucide-react";

interface ChartDataPoint {
  date: string;
  facebook: number;
  instagram: number;
  tiktok: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  totalSpent: string;
  changePercentage: number;
}

export function PerformanceChart({
  data,
  totalSpent,
  changePercentage,
}: PerformanceChartProps) {
  const maxValue = Math.max(
    0,
    ...data.flatMap((d) => [d.facebook, d.instagram, d.tiktok])
  );
  const scale = maxValue > 0 ? 100 / maxValue : 0;

  const yAxisLabels = ["14,500.00", "12,500.00", "10,000.00", "7,500.00", "2,500.00"];

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs font-medium">Amount spent</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{totalSpent}</h1>
        <span
          className={`text-sm font-medium flex items-center gap-1 ${
            changePercentage < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {Math.abs(changePercentage)}%
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d={
                changePercentage < 0
                  ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              }
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      <div className="overflow-x-auto hide-scrollbar -mx-4 md:mx-0 px-4 md:px-0">
        <div className="relative min-w-[500px] md:min-w-0 w-full" style={{ height: "320px" }}>
          <div
            className="absolute left-0 top-0 w-12 md:w-16 flex flex-col justify-between text-[10px] md:text-xs text-gray-400"
            style={{ height: "240px" }}
          >
            {yAxisLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          <div
            className="absolute left-12 md:left-16 right-0 top-0 flex flex-col justify-between"
            style={{ height: "240px" }}
          >
            {yAxisLabels.map((_, i) => (
              <div key={i} className="h-px bg-gray-200 w-full" />
            ))}
          </div>

          <div
            className="absolute left-12 md:left-16 right-0 top-0 flex items-end justify-between gap-2 md:gap-4"
            style={{ height: "240px" }}
          >
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center h-full">
                <div className="w-full flex items-end justify-center gap-1 md:gap-1.5 h-full">
                  <div
                    className="w-6 md:w-8 bg-khaki-200 rounded-t-lg md:rounded-t-xl rounded-b-lg md:rounded-b-xl transition-all hover:opacity-80"
                    style={{ height: `${item.facebook * scale}%` }}
                  />
                  <div
                    className="w-6 md:w-8 bg-[#B8A247] rounded-t-lg md:rounded-t-xl rounded-b-lg md:rounded-b-xl transition-all hover:opacity-80"
                    style={{ height: `${item.instagram * scale}%` }}
                  />
                  <div
                    className="w-6 md:w-8 bg-[#3a3a2a] rounded-t-lg md:rounded-t-xl rounded-b-lg md:rounded-b-xl transition-all hover:opacity-80"
                    style={{ height: `${item.tiktok * scale}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="absolute left-12 md:left-16 right-0 flex justify-between gap-2 md:gap-4"
            style={{ top: "256px" }}
          >
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="flex gap-1 md:gap-1.5 mb-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Instagram className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-black rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 md:w-3 md:h-3 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gray-100 px-1.5 md:px-2.5 py-1 rounded-md">
                  <span className="text-[10px] md:text-xs text-gray-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
