"use client";

import { ChevronRight } from "lucide-react";
import type { CampaignGoal } from "@/lib/campaigns";
import { formatNumber } from "./analytics-format";

type FunnelStage = {
  key: string;
  label: string;
  value: number;
};

/** The outcome event a funnel ends on, per campaign objective. */
const keyEventForGoal = (goal?: CampaignGoal): FunnelStage | null => {
  switch (goal) {
    case "SALES":
      return { key: "purchases", label: "Purchases", value: 0 };
    case "LEADS":
      return { key: "leads", label: "Leads", value: 0 };
    case "APP_PROMOTION":
      return { key: "installs", label: "App installs", value: 0 };
    case "ENGAGEMENT":
      return { key: "engagements", label: "Engagements", value: 0 };
    default:
      return null;
  }
};

/**
 * Impression → click → landing page → key event → purchase funnel (§10.3 of
 * the analytics framework). Stages without platform data are skipped, since
 * metrics with different definitions are never chained silently.
 */
export function FunnelCard({
  impressions,
  clicks,
  landingPageViews,
  outcome,
  goal,
}: {
  impressions: number;
  clicks: number;
  landingPageViews: number;
  outcome: { label: string; value: number } | null;
  goal?: CampaignGoal;
}) {
  const stages: FunnelStage[] = [
    { key: "impressions", label: "Impressions", value: impressions },
    { key: "clicks", label: "Clicks", value: clicks },
  ];
  if (landingPageViews > 0) {
    stages.push({
      key: "landingPageViews",
      label: "Landing page views",
      value: landingPageViews,
    });
  }
  if (outcome && outcome.value > 0) {
    stages.push({ key: "outcome", label: outcome.label, value: outcome.value });
  }

  if (stages.length < 3) return null;

  const maxValue = stages[0]?.value || 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-gilroy-semibold text-gray-900">Funnel</h3>
        <span className="text-xs text-dimGray">
          impression → click{landingPageViews > 0 ? " → landing page" : ""}
          {outcome && outcome.value > 0 ? ` → ${outcome.label.toLowerCase()}` : ""}
        </span>
      </div>
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const previous = index > 0 ? stages[index - 1].value : null;
          const rate =
            previous && previous > 0 ? (stage.value / previous) * 100 : null;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="w-40 shrink-0 text-xs font-gilroy-medium text-dimGray md:text-sm">
                {stage.label}
              </div>
              <div className="h-7 flex-1 overflow-hidden rounded-md bg-gray-100">
                <div
                  className="flex h-full items-center rounded-md bg-[#4E5673] px-2 text-xs font-gilroy-semibold text-white"
                  style={{
                    width: `${Math.max(4, (stage.value / maxValue) * 100)}%`,
                  }}
                >
                  {formatNumber(stage.value)}
                </div>
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-dimGray">
                {rate !== null ? `${rate.toFixed(1)}%` : ""}
              </span>
              {index < stages.length - 1 && (
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-gray-300 sm:block" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
      {goal === "AWARENESS" && (
        <p className="mt-3 text-xs text-dimGray">
          Awareness campaigns are bought on reach, so no outcome event closes
          this funnel.
        </p>
      )}
    </div>
  );
}
