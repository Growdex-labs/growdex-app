"use client";

import Image from "next/image";
import { AlertCircle, Loader2, Sparkles, Users } from "lucide-react";
import type {
  CampaignDto,
  CampaignMetricsSummary,
  CampaignPlatformMetric,
} from "@/lib/campaigns";

interface OverviewProps {
  campaign: CampaignDto;
  metrics: CampaignMetricsSummary | null;
  metricsError: string | null;
  subTab: string;
  onOptimizationClick?: () => void;
}

const formatNumber = (value: number) =>
  Math.trunc(Number.isFinite(value) ? value : 0).toLocaleString("en-US");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const platformValue = (
  rows: CampaignPlatformMetric[],
  platform: CampaignPlatform,
  field: "impressions" | "reach",
) => rows.find((row) => row.platform === platform)?.[field] ?? 0;

type CampaignPlatform = CampaignPlatformMetric["platform"];

function PlatformBreakdown({
  rows,
  field,
}: {
  rows: CampaignPlatformMetric[];
  field: "impressions" | "reach";
}) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto md:gap-6">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
          <Image
            src="/logos_meta-icon.png"
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5"
          />
        </div>
        <span className="text-lg font-gilroy-semibold text-gray-900">
          {formatNumber(platformValue(rows, "meta", field))}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black">
          <svg
            className="h-3.5 w-3.5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </div>
        <span className="text-lg font-gilroy-semibold text-gray-900">
          {formatNumber(platformValue(rows, "tiktok", field))}
        </span>
      </div>
    </div>
  );
}

function CostCard({
  label,
  value,
  campaignName,
  onOptimizationClick,
}: {
  label: string;
  value: string;
  campaignName: string;
  onOptimizationClick?: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <h3 className="text-xs font-gilroy-medium text-dimGray md:text-sm">
        {label}
      </h3>

      <p className="mb-3 mt-3 text-2xl font-gilroy-bold text-gray-900 md:mb-4 md:text-3xl">
        {value}
      </p>

      {onOptimizationClick && (
        <button
          type="button"
          onClick={onOptimizationClick}
          aria-label={`Optimize ${campaignName} ${label.toLowerCase()} with AI`}
          className="flex items-center gap-2 text-xs text-peru-200 hover:text-black-800 md:text-sm"
        >
          <Sparkles className="h-4 w-4" /> Optimize for campaign goal
        </button>
      )}
    </div>
  );
}

export function Overview({
  campaign,
  metrics,
  metricsError,
  subTab,
  onOptimizationClick,
}: OverviewProps) {
  if (metricsError) {
    return (
      <div
        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        data-view={subTab}
      >
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Performance unavailable</p>
          <p className="mt-1">{metricsError}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div
        className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white"
        data-view={subTab}
      >
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (metrics.byPlatform.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"
        data-view={subTab}
      >
        <h2 className="text-lg font-gilroy-semibold text-gray-900">
          No performance data yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-dimGray">
          Once this campaign starts delivering, impressions, reach, and cost
          figures from Meta and TikTok will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-view={subTab}>
      <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
        <p className="text-xs text-dimGray">Total amount spent</p>
        <p className="mt-1 text-2xl font-gilroy-bold text-gray-900 md:text-[28px]">
          {formatCurrency(metrics.spend)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="rounded-xl bg-gray-100 p-4 md:p-6">
          <h3 className="text-xs font-gilroy-medium text-dimGray">
            Impressions
          </h3>
          <p className="mb-4 mt-2 text-2xl font-gilroy-bold text-gray-900 md:mb-6 md:text-3xl">
            {formatNumber(metrics.impressions)} Impressions
          </p>
          <PlatformBreakdown rows={metrics.byPlatform} field="impressions" />
        </div>

        <div className="rounded-xl bg-gray-100 p-4 md:p-6">
          <h3 className="text-xs font-gilroy-medium text-dimGray">
            Total reach
          </h3>
          <p className="mb-4 mt-2 text-2xl font-gilroy-bold text-gray-900 md:mb-6 md:text-3xl">
            {formatNumber(metrics.reach)} reached
          </p>
          <PlatformBreakdown rows={metrics.byPlatform} field="reach" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <CostCard
          label="Cost per Conversion/CPA"
          value={formatCurrency(metrics.cpa)}
          campaignName={campaign.name}
          onOptimizationClick={onOptimizationClick}
        />
        <CostCard
          label="Cost Per Click (CPC)"
          value={formatCurrency(metrics.cpc)}
          campaignName={campaign.name}
          onOptimizationClick={onOptimizationClick}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
          <h3 className="text-xs font-gilroy-medium text-dimGray md:text-sm">
            Click-Through Rate
          </h3>
          <div className="mb-3 mt-3 flex items-center gap-2 md:mb-4">
            <Users className="h-7 w-7 text-gray-500 md:h-9 md:w-9" />
            <span className="text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
              {metrics.ctr.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-dimGray md:text-sm">
            {formatNumber(metrics.clicks)} clicks from{" "}
            {formatNumber(metrics.impressions)} impressions
          </p>
        </div>
      </div>
    </div>
  );
}
