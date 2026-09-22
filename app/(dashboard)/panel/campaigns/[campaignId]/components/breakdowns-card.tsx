"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchCampaignBreakdowns,
  type CampaignBreakdownRow,
  type CampaignPlatform,
} from "@/lib/campaigns";
import { formatCurrency, formatNumber } from "./analytics-format";

const DIMENSIONS = [
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "placement", label: "Placement" },
  { key: "device", label: "Device" },
] as const;

type DimensionKey = (typeof DIMENSIONS)[number]["key"];

/**
 * Platform-native breakdowns (age, gender, placement, device). TikTok only
 * reports age and gender, so those panels simply show the one platform.
 */
export function BreakdownsCard({
  campaignId,
  strategyId,
  currency,
}: {
  campaignId: string;
  strategyId?: string;
  currency?: string;
}) {
  const [dimension, setDimension] = useState<DimensionKey>("age");
  const [rows, setRows] = useState<Record<
    CampaignPlatform,
    CampaignBreakdownRow[]
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setRows(null);
    setError(null);
    fetchCampaignBreakdowns(campaignId, dimension, strategyId)
      .then((result) => {
        if (isMounted) setRows(result.byPlatform);
      })
      .catch((failure) => {
        if (isMounted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load breakdowns.",
          );
        }
      });
    return () => {
      isMounted = false;
    };
  }, [campaignId, dimension, strategyId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-gilroy-semibold text-gray-900">
          Performance breakdown
        </h3>
        <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-0.5">
          {DIMENSIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setDimension(option.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-gilroy-medium transition-colors ${
                dimension === option.key
                  ? "bg-[#4E5673] text-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {!rows && !error && (
        <div className="flex min-h-32 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      )}

      {rows && (
        <div className="space-y-5">
          {(["meta", "tiktok"] as CampaignPlatform[])
            .filter((platform) => (rows[platform] ?? []).length > 0)
            .map((platform) => (
              <div key={platform}>
                <p className="mb-2 text-xs font-gilroy-semibold uppercase tracking-wide text-dimGray">
                  {platform}
                </p>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase text-dimGray">
                      <th className="py-2 pr-4 font-gilroy-medium">
                        {dimension}
                      </th>
                      <th className="px-3 py-2 font-gilroy-medium">Spend</th>
                      <th className="px-3 py-2 font-gilroy-medium">Impr.</th>
                      <th className="px-3 py-2 font-gilroy-medium">CTR</th>
                      <th className="px-3 py-2 font-gilroy-medium">Reach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rows[platform] ?? []).map((row) => (
                      <tr
                        key={row.value}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2 pr-4 font-gilroy-medium text-gray-900">
                          {row.value}
                        </td>
                        <td className="px-3 py-2">
                          {formatCurrency(row.spend, currency)}
                        </td>
                        <td className="px-3 py-2 text-dimGray">
                          {formatNumber(row.impressions)}
                        </td>
                        <td className="px-3 py-2 text-dimGray">
                          {row.ctr.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-dimGray">
                          {formatNumber(row.reach)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          {(["meta", "tiktok"] as CampaignPlatform[]).every(
            (platform) => (rows[platform] ?? []).length === 0,
          ) && (
            <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-dimGray">
              No {dimension} breakdown is available yet
              {dimension !== "age" && dimension !== "gender"
                ? " for TikTok; the platform only reports age and gender splits"
                : ""}
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
