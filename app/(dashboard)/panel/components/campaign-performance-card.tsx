"use client";

import { Flame, MoreVertical } from "lucide-react";

interface CampaignPerformanceCardProps {
  status: string;
}

export function CampaignPerformanceCard({ status }: CampaignPerformanceCardProps) {
  return (
    <div className="bg-dimYellow rounded-xl p-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-sm text-black-800 font-gilroy-regular">
          Campaign Performance
        </span>
        <button className="text-black-800/60 hover:text-black-800" aria-label="Options">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-firebrick-500 rounded-xl flex items-center gap-2 p-2 w-fit">
        <Flame className="w-5 h-5 text-bisque-50" />
        <span className="text-sm text-bisque-50 font-gilroy-regular">
          {status}
        </span>
      </div>
    </div>
  );
}
