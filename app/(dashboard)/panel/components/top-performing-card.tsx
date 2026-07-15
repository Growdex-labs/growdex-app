"use client";

import { Award, MoreVertical, TrendingUp } from "lucide-react";

interface TopPerformingCardProps {
  campaignName: string;
  metricLabel: string;
  trend: number;
}

export function TopPerformingCard({
  campaignName,
  metricLabel,
  trend,
}: TopPerformingCardProps) {
  return (
    <div className="bg-[#f9faff] rounded-xl p-3 h-full flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Award className="w-5 h-5 text-[#3e455c]" />
            <span className="text-sm text-[#3e455c] font-gilroy-regular">
              Top Performing Campaign
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600" aria-label="Options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="text-2xl text-[#3e455c] font-gilroy-semibold">
          {campaignName}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#3e455c] font-gilroy-light">
          {metricLabel}
        </span>
        <div className="flex items-center gap-1 text-[#2e9f5e]">
          <span className="text-sm font-gilroy-regular">
            {Math.abs(trend)}%
          </span>
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
