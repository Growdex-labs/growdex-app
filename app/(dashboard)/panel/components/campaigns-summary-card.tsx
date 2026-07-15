"use client";

import { Megaphone, MoreVertical } from "lucide-react";

export interface CampaignsBreakdown {
  active: number;
  paused: number;
  suspended: number;
  drafts: number;
}

interface CampaignsSummaryCardProps {
  breakdown: CampaignsBreakdown;
}

const STATUS_COLORS: Record<keyof CampaignsBreakdown, string> = {
  active: "#d6c34a",
  paused: "#ffe95c",
  suspended: "#f58d6e",
  drafts: "#d9d9d9",
};

const STATUS_LABELS: Record<keyof CampaignsBreakdown, string> = {
  active: "Active",
  paused: "Paused",
  suspended: "Suspended",
  drafts: "Drafts",
};

export function CampaignsSummaryCard({ breakdown }: CampaignsSummaryCardProps) {
  const total =
    breakdown.active + breakdown.paused + breakdown.suspended + breakdown.drafts;
  const maxValue = Math.max(1, ...Object.values(breakdown));
  const keys = Object.keys(breakdown) as (keyof CampaignsBreakdown)[];

  return (
    <div className="bg-[#f9faff] rounded-xl p-4 h-full flex flex-col justify-between">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Megaphone className="w-5 h-5 text-[#3e455c]" />
            <span className="text-sm text-[#3e455c] font-gilroy-regular">
              Campaigns
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600" aria-label="Options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[40px] leading-none text-[#3e455c] font-gilroy-semibold">
          {total}
        </div>
      </div>

      <div className="bg-white border-[0.5px] border-lavender-50 rounded-lg p-3 flex flex-col gap-2">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-sm text-[#4e5673] font-gilroy-regular">
              {STATUS_LABELS[key]}
            </span>
            <div className="flex-1 flex items-center">
              <div
                className="h-2.5 rounded-xl"
                style={{
                  width: `${(breakdown[key] / maxValue) * 100}%`,
                  minWidth: "8px",
                  background: STATUS_COLORS[key],
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs text-[#4e5673] font-gilroy-light">
              {breakdown[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
