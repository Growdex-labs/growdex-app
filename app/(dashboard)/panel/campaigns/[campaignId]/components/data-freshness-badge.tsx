"use client";

import { CloudUpload, Clock3 } from "lucide-react";
import type { CampaignMetricsDetail } from "@/lib/campaigns";

const formatDay = (value: string | null) => {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(date);
};

const formatSyncedAt = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

/**
 * Data hygiene labels required of every analytics surface: when the numbers
 * were last synced, the last day they describe, and the attribution window
 * each platform reports under. Growdex reporting is always delayed (nightly
 * platform sync), and the badge says so.
 */
export function DataFreshnessBadge({
  freshness,
  currency,
}: {
  freshness?: CampaignMetricsDetail["freshness"];
  currency?: string;
}) {
  if (!freshness) return null;

  const synced = formatSyncedAt(freshness.lastSyncedAt);
  const through = formatDay(freshness.dataThrough);
  const windows = Object.entries(freshness.attribution ?? {});

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dimGray">
      {currency && (
        <span className="font-gilroy-semibold text-gray-700">
          {currency}
        </span>
      )}
      <span
        className="inline-flex items-center gap-1"
        title={freshness.description}
      >
        <Clock3 className="h-3.5 w-3.5" aria-hidden />
        {synced ? `Synced ${synced}` : "Awaiting first sync"}
        {through && ` · data through ${through}`}
        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-gilroy-semibold capitalize">
          {freshness.status}
        </span>
      </span>
      {windows.length > 0 && (
        <span
          className="inline-flex items-center gap-1"
          title={windows
            .map(([platform, entry]) => `${platform}: ${entry.note}`)
            .join("\n")}
        >
          <CloudUpload className="h-3.5 w-3.5" aria-hidden />
          Attribution:{" "}
          {windows
            .map(([, entry]) => entry.window.split("(")[0].trim())
            .join(" · ")}
        </span>
      )}
    </div>
  );
}
