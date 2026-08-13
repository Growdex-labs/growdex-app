"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { CTRLineChart } from "./ctr-line-chart";
import { MetaIcon, PlatformMark } from "./platform-icons";
import { TrendBadge } from "./trend-badge";
import type { PanelPlatform, PanelPlatformMetrics } from "@/lib/panel";

export type RateMetric = "ctr" | "roas" | "clicks" | "conversions" | "cpa";

const TABS: Array<{ id: RateMetric; label: string }> = [
  { id: "ctr", label: "Click-Through Rate" },
  { id: "roas", label: "ROAS" },
  { id: "clicks", label: "Clicks" },
  { id: "conversions", label: "Conversions" },
  { id: "cpa", label: "CPA" },
];

const COMPARED: PanelPlatform[] = ["meta", "tiktok"];

interface ClickThroughRateCardProps {
  /** Account totals per metric. A metric with no source stays undefined. */
  totals: Partial<Record<RateMetric, number>>;
  trend: number;
  byPlatform: Partial<Record<PanelPlatform, PanelPlatformMetrics>>;
  formatMetric: (metric: RateMetric, value: number | undefined) => string;
  /** CPA and ROAS are money-derived, so each reads its own currency bucket. */
  platformCpa: (platform: PanelPlatform) => number | undefined;
  platformRoas: (platform: PanelPlatform) => number | undefined;
}

export function ClickThroughRateCard({
  totals,
  trend,
  byPlatform,
  formatMetric,
  platformCpa,
  platformRoas,
}: ClickThroughRateCardProps) {
  const [metric, setMetric] = useState<RateMetric>("ctr");

  const platformValue = (platform: PanelPlatform) => {
    if (metric === "roas") return platformRoas(platform);
    if (metric === "cpa") return platformCpa(platform);
    return byPlatform[platform]?.[metric];
  };

  return (
    <div className="rounded-xl border border-lavender-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMetric(tab.id)}
              aria-pressed={metric === tab.id}
              className={`font-inter text-sm leading-5 tracking-[-0.14px] transition-colors ${
                metric === tab.id
                  ? "font-bold text-[#4d4d4d]"
                  : "text-lavender-100 hover:text-lavender-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="text-lavender-200 transition-colors hover:text-[#333]"
          aria-label="Rate chart options"
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="font-lexend text-2xl md:text-[28px] text-[#333]">
          {formatMetric(metric, totals[metric])}
        </p>
        <div className="flex flex-wrap items-center gap-6">
          {COMPARED.map((platform) => (
            <div key={platform} className="flex items-center gap-2">
              {platform === "meta" ? (
                <MetaIcon className="size-4" />
              ) : (
                <PlatformMark platform="tiktok" />
              )}
              <span className="font-inter text-sm tracking-[-0.14px] text-[#333]">
                {formatMetric(metric, platformValue(platform))}
              </span>
              <TrendBadge
                trend={trend}
                goodDirection={metric === "cpa" ? "down" : "up"}
              />
            </div>
          ))}
        </div>
      </div>

      <CTRLineChart />
    </div>
  );
}
