"use client";

import { MetricLabel } from "./metric-label";
import { formatCurrency } from "./analytics-format";
import type { CampaignPacing } from "@/lib/campaigns";

const STATUS_COPY: Record<
  CampaignPacing["status"],
  { label: string; barClass: string; note: string }
> = {
  on_track: {
    label: "On track",
    barClass: "bg-emerald-500",
    note: "Spend is pacing with the allocated budget.",
  },
  overspending: {
    label: "Overspending",
    barClass: "bg-firebrick-500",
    note:
      "At this pace the campaign will spend past its allocation before the flight ends.",
  },
  underspending: {
    label: "Underspending",
    barClass: "bg-amber-500",
    note:
      "The campaign is spending well below its allocation; delivery may be limited.",
  },
  not_started: {
    label: "Not started",
    barClass: "bg-gray-300",
    note: "The scheduled start date has not arrived yet.",
  },
  completed: {
    label: "Flight ended",
    barClass: "bg-gray-400",
    note: "The scheduled flight window has ended.",
  },
};

/**
 * Budget spent against the budget allocated over the flight so far, with the
 * end-of-flight projection. Replaces the decorative burn badge with numbers.
 */
export function PacingCard({ pacing }: { pacing: CampaignPacing }) {
  const status = STATUS_COPY[pacing.status];
  const percent = Math.max(0, Math.min(100, pacing.percentSpent));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="flex items-center justify-between">
        <MetricLabel metricKey="pacing" className="text-sm font-gilroy-semibold text-gray-900" />
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-gilroy-bold uppercase text-gray-600">
          {status.label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-gilroy-bold text-gray-900">
        {formatCurrency(pacing.spentSoFar, pacing.currency)}
        <span className="ml-1 text-sm font-gilroy-regular text-dimGray">
          of {formatCurrency(pacing.totalAllocation, pacing.currency)}{" "}
          {pacing.budgetType}
        </span>
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${status.barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-dimGray">
        {Math.round(pacing.percentSpent)}% spent · day {pacing.daysElapsed} of{" "}
        {pacing.flightDays} · projected{" "}
        {formatCurrency(pacing.projectedSpend, pacing.currency)} by end of
        flight
      </p>
      {pacing.status !== "on_track" && (
        <p className="mt-1 text-xs text-gray-600">{status.note}</p>
      )}
    </div>
  );
}
