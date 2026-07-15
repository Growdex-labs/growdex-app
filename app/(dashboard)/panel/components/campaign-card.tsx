"use client";

import {
  TrendingDown,
  MoreVertical,
  Sparkles,
  Image as ImageIcon,
  Pencil,
  Users,
  Settings2,
} from "lucide-react";

export interface CampaignCardData {
  id: string;
  name: string;
  amount: string;
  status: string; // "Fabulous run!" | "Budget Burn"
  variant: "top" | "burn";
  ctr: string; // "35.7%"
  cpc: string; // "N350.89"
  cost: string; // "N1,300.80"
  priority: string; // "High priority"
}

const REC_ICONS = [
  { bg: "bg-rose-500", Icon: ImageIcon },
  { bg: "bg-green-500", Icon: Pencil },
  { bg: "bg-indigo-500", Icon: Users },
  { bg: "bg-teal-500", Icon: Settings2 },
];

export function CampaignCard({ data }: { data: CampaignCardData }) {
  const isTop = data.variant === "top";
  const accent = isTop ? "text-green-600" : "text-red-500";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isTop ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"
      }`}
    >
      {/* Status + menu */}
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${accent}`}
        >
          <img
            src={isTop ? "/mdi_greenfire.png" : "/mdi_fire.png"}
            alt=""
            className="w-4 h-4"
          />
          {data.status}
        </span>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          aria-label="Campaign options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Name + amount */}
      <div className="mt-1 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900 truncate">
          {data.name}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 shrink-0">
          <img src="/cash.png" alt="" className="w-4 h-4" />
          {data.amount}
        </span>
      </div>

      {/* Metrics */}
      <div
        className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${accent}`}
      >
        <span className="inline-flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" /> CTR {data.ctr}
        </span>
        <span className="text-gray-300">•</span>
        <span className="inline-flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" /> CPC {data.cpc}
        </span>
        <span className="text-gray-300">•</span>
        <span className="inline-flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" /> {data.cost}
        </span>
      </div>

      <hr className="my-3 border-gray-200" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 text-violet-500 mr-1" />
            <div className="flex -space-x-1.5">
              {REC_ICONS.map(({ bg, Icon }, i) => (
                <span
                  key={i}
                  className={`flex items-center justify-center w-5 h-5 rounded-full ring-2 ring-white ${bg}`}
                >
                  <Icon className="w-2.5 h-2.5 text-white" />
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-500 truncate">
            Recommendations available
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
          {data.priority}
        </span>
      </div>
    </div>
  );
}

export default CampaignCard;
