"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchCampaignAdMetrics,
  type CampaignAdMetricRow,
} from "@/lib/campaigns";
import { formatCurrency, formatNumber } from "./analytics-format";
import { MetricLabel } from "./metric-label";

/**
 * Creative comparison view: one row per ad under the campaign with the
 * metrics to compare spend efficiency and creative performance. Best and
 * worst cost-per-result rows are highlighted when a result exists.
 */
export function AdsTable({
  campaignId,
  strategyId,
  currency,
}: {
  campaignId: string;
  strategyId?: string;
  currency?: string;
}) {
  const [ads, setAds] = useState<CampaignAdMetricRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setAds(null);
    setError(null);
    fetchCampaignAdMetrics(campaignId, strategyId)
      .then((result) => {
        if (isMounted) setAds(result.ads);
      })
      .catch((failure) => {
        if (isMounted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load ad-level metrics.",
          );
        }
      });
    return () => {
      isMounted = false;
    };
  }, [campaignId, strategyId]);

  if (error) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {error}
      </p>
    );
  }

  if (!ads) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-gray-200">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!ads.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-dimGray">
        Ad-level metrics are not available yet. Platforms expose them shortly
        after delivery starts.
      </p>
    );
  }

  const withResult = ads.filter((ad) => (ad.metrics.conversions ?? 0) > 0);
  const bestCpa =
    withResult.length > 1
      ? Math.min(...withResult.map((ad) => ad.metrics.cpa))
      : null;
  const worstCpa =
    withResult.length > 1
      ? Math.max(...withResult.map((ad) => ad.metrics.cpa))
      : null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-dimGray">
            <th className="py-3 pr-4 font-gilroy-medium">Ad</th>
            <th className="px-4 py-3 font-gilroy-medium">Platform</th>
            <th className="px-4 py-3 font-gilroy-medium">Spend</th>
            <th className="px-4 py-3 font-gilroy-medium">Impr.</th>
            <th className="px-4 py-3 font-gilroy-medium">CTR</th>
            <th className="px-4 py-3 font-gilroy-medium">
              <MetricLabel metricKey="cpa" />
            </th>
            <th className="px-4 py-3 font-gilroy-medium">Results</th>
            {ads.some((ad) => (ad.metrics.videoViews ?? 0) > 0) && (
              <th className="px-4 py-3 font-gilroy-medium">Video views</th>
            )}
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => {
            const isBest = bestCpa !== null && ad.metrics.cpa === bestCpa;
            const isWorst = worstCpa !== null && ad.metrics.cpa === worstCpa;
            return (
              <tr
                key={`${ad.platform}-${ad.adId}`}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="max-w-60 truncate py-3 pr-4 font-gilroy-medium text-gray-900">
                  {ad.adName}
                  {isBest && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-gilroy-bold uppercase text-emerald-700">
                      Best cost per result
                    </span>
                  )}
                  {isWorst && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-gilroy-bold uppercase text-red-700">
                      Weakest
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 capitalize text-dimGray">
                  {ad.platform}
                </td>
                <td className="px-4 py-3">
                  {formatCurrency(ad.metrics.spend, currency)}
                </td>
                <td className="px-4 py-3 text-dimGray">
                  {formatNumber(ad.metrics.impressions)}
                </td>
                <td className="px-4 py-3 text-dimGray">
                  {(ad.metrics.ctr ?? 0).toFixed(2)}%
                </td>
                <td className="px-4 py-3">
                  {(ad.metrics.conversions ?? 0) > 0
                    ? formatCurrency(ad.metrics.cpa, currency)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-dimGray">
                  {formatNumber(ad.metrics.conversions ?? 0)}
                </td>
                {(ad.metrics.videoViews ?? 0) > 0 || ads.some((a) => (a.metrics.videoViews ?? 0) > 0) ? (
                  <td className="px-4 py-3 text-dimGray">
                    {formatNumber(ad.metrics.videoViews ?? 0)}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
