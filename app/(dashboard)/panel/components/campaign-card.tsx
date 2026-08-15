"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { CampaignDto } from "@/lib/campaigns";
import { MetaIcon, PlatformMark } from "./platform-icons";
import { CampaignTrendLine } from "./campaign-trend-line";

export type CampaignCardStats = {
  spend: number | null;
  ctr: number | null;
  cpc: number | null;
  cpa: number | null;
  currency: string;
  recommendationCount: number;
  /** Click through rate per day, oldest day first. */
  trend: number[];
};

interface CampaignCardProps {
  campaign: CampaignDto;
  href: string;
  stats?: CampaignCardStats;
  loading?: boolean;
}

const STATUS_PILLS: Record<string, string> = {
  active: "border-emerald-100 bg-mintcream-50 text-emerald-700",
  paused: "border-khaki-300 bg-dimYellow text-black-800",
  failed: "border-bisque-100 bg-bisque-50 text-firebrick-500",
  completed: "border-lavender-100 bg-lavender-50 text-lavender-300",
  draft: "border-lavender-100 bg-white text-lavender-200",
};

const pillFor = (status?: string): string => {
  const value = (status ?? "draft").toLowerCase();
  if (value === "rejected") return STATUS_PILLS.failed;
  return STATUS_PILLS[value] ?? STATUS_PILLS.draft;
};

const statusLabel = (status?: string) => {
  const value = (status ?? "draft").replaceAll("_", " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/** The headline figure is read at a glance, where kobo is noise. */
const formatTotal = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * A cost per click can be a fraction of a unit, where the decimals are the
 * whole figure. Above a hundred they are noise, so they go.
 */
const formatUnit = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.abs(amount) >= 100 ? 0 : 2,
  }).format(amount);

const budgetTotal = (campaign: CampaignDto) =>
  campaign.audienceStrategies.reduce(
    (total, strategy) => total + strategy.budget.amount,
    0,
  );

const budgetCurrency = (campaign: CampaignDto) =>
  campaign.audienceStrategies[0]?.budget.currency ?? "NGN";

const formatRate = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${Number(value.toFixed(1))}%`
    : "—";

const formatAmount = (value: number | null | undefined, currency: string) =>
  typeof value === "number" && Number.isFinite(value)
    ? formatUnit(value, currency)
    : "—";

export function CampaignCard({
  campaign,
  href,
  stats,
  loading = false,
}: CampaignCardProps) {
  const currency = stats?.currency ?? budgetCurrency(campaign);

  // Budget is what a campaign was given and spend is what it took. One figure
  // cannot stand for both, so the label names whichever this is.
  const hasSpend = typeof stats?.spend === "number" && stats.spend > 0;
  const amount = hasSpend ? stats!.spend! : budgetTotal(campaign);
  const recommendationCount = stats?.recommendationCount ?? 0;

  // Only the click through rate carries a fortnight of history, so only it
  // gets a line.
  const metrics = [
    { label: "CTR", value: formatRate(stats?.ctr), trend: stats?.trend },
    { label: "CPC", value: formatAmount(stats?.cpc, currency), trend: undefined },
    { label: "CPA", value: formatAmount(stats?.cpa, currency), trend: undefined },
  ];

  const footer = campaign.publishError ? (
    <p className="flex gap-2 rounded-xl bg-bisque-50 p-3 text-xs leading-5 text-firebrick-500">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="line-clamp-2">{campaign.publishError}</span>
    </p>
  ) : recommendationCount > 0 ? (
    <Link
      href={`/panel/campaigns/${encodeURIComponent(campaign.id)}?optimize=1`}
      className="relative z-10 flex items-center justify-between gap-2 rounded-xl bg-khaki-200 px-3.5 py-2.5 text-sm font-gilroy-semibold text-black-800 transition-colors hover:bg-khaki-300"
    >
      {recommendationCount === 1
        ? "1 action ready"
        : `${recommendationCount} actions ready`}
      <ArrowRight className="size-4 shrink-0" aria-hidden />
    </Link>
  ) : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:border-gray-300 hover:shadow-md focus-within:ring-2 focus-within:ring-khaki-300 motion-safe:hover:-translate-y-0.5">
      <div className="flex flex-1 flex-col p-5">
        {/* Identity and state share the top line. The name gets a line of its
            own, so a long status can never squeeze it. */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center -space-x-1.5">
            {campaign.platforms.includes("meta") && (
              <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 ring-2 ring-white">
                <MetaIcon className="size-4" />
              </span>
            )}
            {campaign.platforms.includes("tiktok") && (
              <span className="flex size-7 items-center justify-center rounded-full bg-black ring-2 ring-white">
                <PlatformMark
                  platform="tiktok"
                  className="size-4 brightness-0 invert"
                />
              </span>
            )}
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-gilroy-medium ${pillFor(campaign.status)}`}
          >
            {statusLabel(campaign.status)}
          </span>
        </div>

        <h2 className="mt-3 line-clamp-2 text-lg leading-6 font-gilroy-bold text-gray-900">
          <Link href={href} className="outline-none after:absolute after:inset-0">
            {campaign.name}
          </Link>
        </h2>

        <div className="mt-5">
          <p className="text-xs text-dimGray">{hasSpend ? "Spent" : "Budget"}</p>
          {loading ? (
            <span className="mt-1 block h-7 w-36 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="font-gilroy-bold text-2xl text-gray-900">
              {amount > 0 ? formatTotal(amount, currency) : "—"}
            </p>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-xs text-dimGray">{metric.label}</dt>
              {loading ? (
                <dd className="mt-1 h-4 w-12 animate-pulse rounded bg-gray-100" />
              ) : (
                <dd className="flex items-center gap-1.5 font-gilroy-semibold text-gray-900">
                  <span className="truncate">{metric.value}</span>
                  {metric.trend && (
                    <CampaignTrendLine
                      values={metric.trend}
                      label={`Click through rate over the last ${metric.trend.length} days`}
                    />
                  )}
                </dd>
              )}
            </div>
          ))}
        </dl>

        {/* The gap belongs to the footer, so a card without one ends level with
            the padding it started in. */}
        {footer && <div className="mt-auto pt-5">{footer}</div>}
      </div>
    </div>
  );
}

export default CampaignCard;
