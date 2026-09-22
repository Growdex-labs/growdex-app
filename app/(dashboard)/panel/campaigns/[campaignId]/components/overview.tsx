"use client";

import Image from "next/image";
import { AlertCircle, Loader2, Users } from "lucide-react";
import { TrendBadge } from "../../../components/trend-badge";
import type {
  CampaignDto,
  CampaignGoal,
  CampaignMetricTotals,
  CampaignMetricsDetail,
  CampaignPlatformMetric,
} from "@/lib/campaigns";
import { formatCurrency, formatNumber } from "./analytics-format";
import { MetricLabel } from "./metric-label";
import { DataFreshnessBadge } from "./data-freshness-badge";
import { FunnelCard } from "./funnel-card";
import { PacingCard } from "./pacing-card";
import { SignalsCard } from "./signals-card";
import { RejectedAdsPanel } from "./rejected-ads-panel";
import { AdsTable } from "./ads-table";
import { BreakdownsCard } from "./breakdowns-card";
import { CTRLineChart } from "../../../components/ctr-line-chart";

interface OverviewProps {
  campaign: CampaignDto;
  detail: CampaignMetricsDetail | null;
  metricsError: string | null;
  subTab: string;
  /** Selected audience strategy, when the view is narrowed to one ad set. */
  strategyId?: string;
  onOptimizationClick?: () => void;
}

const GOAL_LABELS: Record<CampaignGoal, string> = {
  AWARENESS: "Awareness / Reach",
  TRAFFIC: "Traffic",
  ENGAGEMENT: "Engagement",
  LEADS: "Leads",
  APP_PROMOTION: "App promotion",
  SALES: "Sales",
};

type PlatformBreakdownField = "impressions" | "reach";

const platformValue = (
  rows: CampaignPlatformMetric[],
  platform: CampaignPlatformMetric["platform"],
  field: PlatformBreakdownField,
) => rows.find((row) => row.platform === platform)?.[field] ?? 0;

function PlatformBreakdown({
  rows,
  field,
}: {
  rows: CampaignPlatformMetric[];
  field: PlatformBreakdownField;
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

type KpiCard = {
  metricKey: string;
  value: string;
  trend?: number | null;
  goodDirection?: "up" | "down";
  sub?: string;
};

/**
 * The objective's own KPI set (§10.1): every goal gets the metrics that
 * answer its primary question first, on top of the delivery basics.
 */
const objectiveKpis = (
  goal: CampaignGoal | undefined,
  totals: CampaignMetricTotals,
  currency: string,
): KpiCard[] => {
  const engagements =
    (totals.likes ?? 0) +
    (totals.comments ?? 0) +
    (totals.shares ?? 0) +
    (totals.saves ?? 0);
  switch (goal) {
    case "AWARENESS":
      return [
        {
          metricKey: "costPerThousandReached",
          value: formatCurrency(totals.costPerThousandReached ?? 0, currency),
          goodDirection: "down",
          sub: `${formatNumber(totals.reach)} people reached`,
        },
        {
          metricKey: "cpm",
          value: formatCurrency(totals.cpm, currency),
          goodDirection: "down",
        },
        {
          metricKey: "frequency",
          value: (totals.frequency ?? 0).toFixed(2),
          goodDirection: "down",
          sub: "average views per person reached",
        },
      ];
    case "TRAFFIC":
      return [
        {
          metricKey: "clicks",
          value: formatNumber(totals.clicks),
        },
        {
          metricKey: "cpc",
          value: formatCurrency(totals.cpc, currency),
          goodDirection: "down",
        },
        {
          metricKey: "landingPageViews",
          value: formatNumber(totals.landingPageViews ?? 0),
          sub: `${formatNumber(totals.outboundClicks ?? 0)} outbound clicks`,
        },
      ];
    case "ENGAGEMENT":
      return [
        {
          metricKey: "engagements",
          value: formatNumber(engagements),
        },
        {
          metricKey: "engagementRate",
          value: `${(totals.engagementRate ?? 0).toFixed(2)}%`,
        },
        {
          metricKey: "costPerEngagement",
          value: formatCurrency(totals.costPerEngagement ?? 0, currency),
          goodDirection: "down",
        },
      ];
    case "LEADS":
      return [
        { metricKey: "leads", value: formatNumber(totals.leads) },
        {
          metricKey: "costPerLead",
          value: formatCurrency(totals.costPerLead ?? 0, currency),
          goodDirection: "down",
        },
        {
          metricKey: "leadConversionRate",
          value: `${(totals.leadConversionRate ?? 0).toFixed(2)}%`,
        },
      ];
    case "APP_PROMOTION":
      return [
        {
          metricKey: "conversions",
          value: formatNumber(totals.conversions),
          sub: "attributed installs & events",
        },
        {
          metricKey: "costPerInstall",
          value: formatCurrency(totals.cpa, currency),
          goodDirection: "down",
        },
      ];
    case "SALES":
      return [
        { metricKey: "purchases", value: formatNumber(totals.purchases) },
        {
          metricKey: "revenue",
          value: formatCurrency(totals.revenue, currency),
        },
        {
          metricKey: "roas",
          value: totals.roas !== null ? `${totals.roas.toFixed(2)}x` : "—",
          goodDirection: "up",
        },
        {
          metricKey: "aov",
          value: formatCurrency(totals.aov ?? 0, currency),
        },
      ];
    default:
      return [];
  }
};

function KpiTile({
  card,
  showTrend,
}: {
  card: KpiCard;
  showTrend: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <MetricLabel metricKey={card.metricKey} />
        {showTrend && card.trend != null && (
          <TrendBadge
            trend={Math.round(Math.abs(card.trend)) * (card.trend < 0 ? -1 : 1)}
            goodDirection={card.goodDirection ?? "up"}
            className="text-xs font-gilroy-semibold"
            iconClassName="h-4 w-4"
          />
        )}
      </div>
      <p className="mb-1 mt-3 text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
        {card.value}
      </p>
      {card.sub && <p className="text-xs text-dimGray">{card.sub}</p>}
    </div>
  );
}

export function Overview({
  campaign,
  detail,
  metricsError,
  subTab,
  strategyId,
  onOptimizationClick,
}: OverviewProps) {
  if (metricsError) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Performance unavailable</p>
          <p className="mt-1">{metricsError}</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (detail.byPlatform.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
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

  const currency = detail.currency ?? "NGN";
  const totals: CampaignMetricTotals =
    detail.totals ??
    (() => {
      const rows = detail.byPlatform;
      const sum = (pick: (row: CampaignPlatformMetric) => number) =>
        rows.reduce((acc, row) => acc + pick(row), 0);
      const spend = sum((row) => row.spend);
      const impressions = sum((row) => row.impressions);
      const clicks = sum((row) => row.clicks);
      const conversions = sum((row) => row.conversions);
      const reach = sum((row) => row.reach);
      const revenue = sum((row) => row.revenue ?? 0);
      const engagements =
        sum((row) => row.likes ?? 0) +
        sum((row) => row.comments ?? 0) +
        sum((row) => row.shares ?? 0) +
        sum((row) => row.saves ?? 0);
      const videoViews = sum((row) => row.videoViews ?? 0);
      const videoP100 = sum((row) => row.videoP100 ?? 0);
      const landingPageViews = sum((row) => row.landingPageViews ?? 0);
      const leadDenominator = Math.max(landingPageViews, clicks);
      const leadCount = sum((row) => row.leads ?? 0);
      const purchaseCount = sum((row) => row.purchases ?? 0);
      return {
        spend,
        impressions,
        clicks,
        conversions,
        reach,
        revenue,
        engagements,
        videoViews,
        videoP100,
        likes: sum((row) => row.likes ?? 0),
        comments: sum((row) => row.comments ?? 0),
        shares: sum((row) => row.shares ?? 0),
        saves: sum((row) => row.saves ?? 0),
        leads: sum((row) => row.leads ?? 0),
        formOpens: sum((row) => row.formOpens ?? 0),
        landingPageViews,
        outboundClicks: sum((row) => row.outboundClicks ?? 0),
        addToCart: sum((row) => row.addToCart ?? 0),
        initiatedCheckout: sum((row) => row.initiatedCheckout ?? 0),
        purchases: sum((row) => row.purchases ?? 0),
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        cpa: conversions > 0 ? spend / conversions : 0,
        cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
        roas: spend > 0 ? revenue / spend : null,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        frequency: reach > 0 ? impressions / reach : 0,
        videoCompletionRate:
          videoViews > 0 ? (videoP100 / videoViews) * 100 : 0,
        videoViewRate:
          impressions > 0 ? (videoViews / impressions) * 100 : 0,
        costPerVideoView: videoViews > 0 ? spend / videoViews : 0,
        engagementRate:
          impressions > 0 ? (engagements / impressions) * 100 : 0,
        costPerEngagement: engagements > 0 ? spend / engagements : 0,
        costPerLead: leadCount > 0 ? spend / leadCount : 0,
        leadConversionRate:
          leadDenominator > 0 ? (leadCount / leadDenominator) * 100 : 0,
        aov: purchaseCount > 0 ? revenue / purchaseCount : null,
        costPerThousandReached: reach > 0 ? (spend / reach) * 1000 : 0,
      };
    })();

  const comparison = detail.comparison ?? null;
  const change = comparison?.change ?? {};
  const hasTrend = (key: string) =>
    typeof change[key] === "number" && change[key] !== null;
  const trendOf = (key: string) =>
    hasTrend(key) ? Math.round(change[key] as number) : undefined;

  const goal = detail.objective ?? campaign.goal;
  const kpis = objectiveKpis(goal, totals, currency);

  const videoViews = totals.videoViews ?? 0;
  const engagements =
    (totals.likes ?? 0) + (totals.comments ?? 0) + (totals.shares ?? 0) + (totals.saves ?? 0);
  const leads = totals.leads ?? 0;
  const showVideo = videoViews > 0;
  const showEngagement = engagements > 0;
  const showLeads = leads > 0;

  const learningEntries = (campaign.platformStatuses?.meta?.learning ?? []).filter(
    (entry) => entry.stage === "LEARNING" || entry.stage === "FAIL",
  );

  if (subTab === "table") {
    return (
      <div className="space-y-6">
        <AdsTable
          campaignId={campaign.id}
          strategyId={strategyId}
          currency={currency}
        />
        <BreakdownsCard
          campaignId={campaign.id}
          strategyId={strategyId}
          currency={currency}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataFreshnessBadge
        freshness={detail.freshness}
        currency={currency}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-dimGray">
        <span className="rounded-full bg-khaki-200 px-3 py-1 font-gilroy-semibold text-gray-900">
          Objective: {GOAL_LABELS[goal] ?? goal}
        </span>
        {detail.conversionContext?.map((context) => (
          <span
            key={context.platform}
            className="rounded-full bg-gray-100 px-3 py-1"
            title={`${context.platform} counts this event as the campaign result`}
          >
            {context.platform} result event: {context.event}
          </span>
        ))}
      </div>

      {learningEntries.length > 0 && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
          {learningEntries.map((entry) => (
            <p key={entry.adSetId ?? entry.name}>
              <span className="font-gilroy-semibold">
                {entry.name || "An ad set"}
              </span>{" "}
              {entry.stage === "FAIL"
                ? "could not exit the learning phase on Meta — widen the audience or raise the budget."
                : "is in the learning phase on Meta — costs may stay unstable until it exits."}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="rounded-xl bg-gray-100 p-4 md:p-6">
          <MetricLabel metricKey="spend" />
          <p className="mb-4 mt-2 text-2xl font-gilroy-bold text-gray-900 md:mb-6 md:text-[28px]">
            {formatCurrency(totals.spend, currency)}
          </p>
          {hasTrend("spend") && (
            <TrendBadge
              trend={trendOf("spend") ?? 0}
              className="text-xs font-gilroy-semibold"
              iconClassName="h-4 w-4"
            />
          )}
        </div>
        {detail.pacing && <PacingCard pacing={detail.pacing} />}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="rounded-xl bg-gray-100 p-4 md:p-6">
          <MetricLabel metricKey="impressions" />
          <p className="mb-4 mt-2 text-2xl font-gilroy-bold text-gray-900 md:mb-6 md:text-3xl">
            {formatNumber(totals.impressions)} Impressions
          </p>
          <PlatformBreakdown rows={detail.byPlatform} field="impressions" />
        </div>

        <div className="rounded-xl bg-gray-100 p-4 md:p-6">
          <MetricLabel metricKey="reach" />
          <p className="mb-4 mt-2 text-2xl font-gilroy-bold text-gray-900 md:mb-6 md:text-3xl">
            {formatNumber(totals.reach)} reached
          </p>
          <PlatformBreakdown rows={detail.byPlatform} field="reach" />
        </div>
      </div>

      {kpis.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-gilroy-semibold text-gray-900">
            {GOAL_LABELS[goal] ?? goal} KPIs
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {kpis.map((card, index) => (
              <KpiTile
                key={card.metricKey}
                card={card}
                showTrend={index > 0 || Boolean(card.trend)}
              />
            ))}
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <MetricLabel metricKey="cpa" />
                {hasTrend("cpa") && (
                  <TrendBadge
                    trend={trendOf("cpa") ?? 0}
                    goodDirection="down"
                    className="text-xs font-gilroy-semibold"
                    iconClassName="h-4 w-4"
                  />
                )}
              </div>
              <p className="mb-3 mt-3 text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
                {formatCurrency(totals.cpa, currency)}
              </p>
              <button
                type="button"
                onClick={onOptimizationClick}
                className="flex items-center gap-2 text-xs text-peru-200 hover:text-black-800 md:text-sm"
              >
                Optimize for campaign goal
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <MetricLabel metricKey="cpc" />
                {hasTrend("cpc") && (
                  <TrendBadge
                    trend={trendOf("cpc") ?? 0}
                    goodDirection="down"
                    className="text-xs font-gilroy-semibold"
                    iconClassName="h-4 w-4"
                  />
                )}
              </div>
              <p className="mb-3 mt-3 text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
                {formatCurrency(totals.cpc, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <MetricLabel metricKey="ctr" />
                {hasTrend("ctr") && (
                  <TrendBadge
                    trend={trendOf("ctr") ?? 0}
                    className="text-xs font-gilroy-semibold"
                    iconClassName="h-4 w-4"
                  />
                )}
              </div>
              <div className="mb-3 mt-3 flex items-center gap-2">
                <Users className="h-7 w-7 text-gray-500 md:h-9 md:w-9" />
                <span className="text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
                  {totals.ctr.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-dimGray md:text-sm">
                {formatNumber(totals.clicks)} clicks from{" "}
                {formatNumber(totals.impressions)} impressions
              </p>
            </div>
            {totals.conversions > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <MetricLabel metricKey="conversions" />
                  {hasTrend("conversions") && (
                    <TrendBadge
                      trend={trendOf("conversions") ?? 0}
                      className="text-xs font-gilroy-semibold"
                      iconClassName="h-4 w-4"
                    />
                  )}
                </div>
                <p className="mb-3 mt-3 text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
                  {formatNumber(totals.conversions)}
                </p>
                <p className="text-xs text-dimGray">
                  {totals.clicks > 0
                    ? `${((totals.conversions / totals.clicks) * 100).toFixed(2)}% of clicks`
                    : "attributed conversions"}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <MetricLabel metricKey="cpm" />
              <p className="mb-1 mt-3 text-2xl font-gilroy-bold text-gray-900 md:text-3xl">
                {formatCurrency(totals.cpm, currency)}
              </p>
              <p className="text-xs text-dimGray">cost per 1,000 impressions</p>
            </div>
          </div>
        </div>
      )}

      {showVideo && (
        <div>
          <h3 className="mb-3 text-sm font-gilroy-semibold text-gray-900">
            Video performance
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            <KpiTile card={{ metricKey: "videoViews", value: formatNumber(videoViews) }} showTrend={false} />
            <KpiTile
              card={{
                metricKey: "videoCompletionRate",
                value: `${(totals.videoP100 && videoViews > 0 ? (totals.videoP100 / videoViews) * 100 : 0).toFixed(1)}%`,
              }}
              showTrend={false}
            />
            <KpiTile
              card={{
                metricKey: "videoAvgWatchSeconds",
                value: `${(
                  detail.byPlatform.reduce(
                    (sum, row) => sum + (row.videoAvgWatchSeconds ?? 0),
                    0,
                  ) / Math.max(1, detail.byPlatform.length)
                ).toFixed(1)}s`,
              }}
              showTrend={false}
            />
            <KpiTile
              card={{
                metricKey: "costPerVideoView",
                value: formatCurrency(
                  videoViews > 0 ? totals.spend / videoViews : 0,
                  currency,
                ),
                goodDirection: "down",
              }}
              showTrend={false}
            />
          </div>
        </div>
      )}

      {showEngagement && (
        <div>
          <h3 className="mb-3 text-sm font-gilroy-semibold text-gray-900">
            Engagement
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            <KpiTile card={{ metricKey: "engagements", value: formatNumber(engagements) }} showTrend={false} />
            <KpiTile
              card={{
                metricKey: "engagementRate",
                value: `${(totals.impressions > 0 ? (engagements / totals.impressions) * 100 : 0).toFixed(2)}%`,
              }}
              showTrend={false}
            />
            <KpiTile
              card={{
                metricKey: "costPerEngagement",
                value: formatCurrency(
                  engagements > 0 ? totals.spend / engagements : 0,
                  currency,
                ),
                goodDirection: "down",
              }}
              showTrend={false}
            />
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <div className="flex h-full flex-col justify-between gap-3 text-xs text-dimGray">
                <span>{formatNumber(totals.likes ?? 0)} likes</span>
                <span>{formatNumber(totals.comments ?? 0)} comments</span>
                <span>{formatNumber(totals.shares ?? 0)} shares</span>
                <span>{formatNumber(totals.saves ?? 0)} saves</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeads && (
        <div>
          <h3 className="mb-3 text-sm font-gilroy-semibold text-gray-900">
            Lead generation
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            <KpiTile card={{ metricKey: "leads", value: formatNumber(leads) }} showTrend={false} />
            {totals.formOpens ? (
              <KpiTile card={{ metricKey: "formOpens", value: formatNumber(totals.formOpens) }} showTrend={false} />
            ) : null}
            <KpiTile
              card={{
                metricKey: "leadConversionRate",
                value: `${((leads / Math.max(totals.landingPageViews ?? 0, totals.clicks, 1)) * 100).toFixed(2)}%`,
              }}
              showTrend={false}
            />
          </div>
        </div>
      )}

      {detail.trend.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center justify-between">
            <MetricLabel metricKey="ctr" className="text-sm font-gilroy-semibold text-gray-900" />
            <span className="text-xs text-dimGray">
              last {Math.min(detail.trend.length, 28)} days
            </span>
          </div>
          <CTRLineChart
            series={[
              {
                key: "ctr",
                color: "#4E5673",
                data: detail.trend.map((point) => point.ctr),
              },
            ]}
          />
        </div>
      )}

      <FunnelCard
        impressions={totals.impressions}
        clicks={totals.clicks}
        landingPageViews={totals.landingPageViews ?? 0}
        goal={goal}
        outcome={
          goal === "SALES"
            ? { label: "Purchases", value: totals.purchases ?? 0 }
            : goal === "LEADS"
              ? { label: "Leads", value: leads }
              : goal === "ENGAGEMENT"
                ? { label: "Engagements", value: engagements }
                : goal === "APP_PROMOTION"
                  ? { label: "App installs", value: totals.conversions }
                  : null
        }
      />

      <SignalsCard signals={detail.signals ?? []} />

      <RejectedAdsPanel platformStatuses={campaign.platformStatuses} />
    </div>
  );
}
