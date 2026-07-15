"use client";

import { useEffect, useState } from "react";
import { PanelLayout } from "./components/panel-layout";
import { DashboardHeader } from "./components/dashboard-header";
import { PerformanceChart } from "./components/performance-chart";
import { CTRLineChart } from "./components/ctr-line-chart";
import { DonutChart } from "./components/donut-chart";
import { CampaignsSummaryCard, CampaignsBreakdown } from "./components/campaigns-summary-card";
import { TopPerformingCard } from "./components/top-performing-card";
import { CampaignPerformanceCard } from "./components/campaign-performance-card";
import { MetaIcon, TikTokIcon } from "./components/platform-icons";
import { DashboardEmptyState } from "./components/dashboard-empty-state";
import { Users, TrendingDown, MoreVertical } from "lucide-react";
import { fetchPanelMetrics } from "@/lib/panel";

type DashboardMetrics = {
  totalSpent: number;
  totalImpressions: number;
  costPerConversion: { value: number; trend: number };
  costPerClick: { value: number; trend: number };
  clickThroughRate: { meta: number; tiktok: number; trend: number };
  audienceReception: { value: string; trend: number };
  impressionsByPlatform: { meta: number; instagram: number; tiktok: number };
  campaigns: CampaignsBreakdown;
  topCampaign: { name: string; metricLabel: string; trend: number };
  campaignHealth: string;
};

const ZERO_METRICS: DashboardMetrics = {
  totalSpent: 0,
  totalImpressions: 0,
  costPerConversion: { value: 0, trend: 0 },
  costPerClick: { value: 0, trend: 0 },
  clickThroughRate: { meta: 0, tiktok: 0, trend: 0 },
  audienceReception: { value: "0", trend: 0 },
  impressionsByPlatform: { meta: 0, instagram: 0, tiktok: 0 },
  campaigns: { active: 0, paused: 0, suspended: 0, drafts: 0 },
  topCampaign: { name: "—", metricLabel: "Cost per Conversion/CPA", trend: 0 },
  campaignHealth: "—",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatNumber = (value: number) =>
  Math.trunc(Number.isFinite(value) ? value : 0).toLocaleString("en-US");

function TrendBadge({ trend }: { trend: number }) {
  return (
    <div className="flex items-center gap-1 text-firebrick-500">
      <span className="text-sm font-gilroy-regular">{Math.abs(trend)}%</span>
      <TrendingDown className="w-5 h-5" />
    </div>
  );
}

function SideMetricCard({
  label,
  children,
  trend,
}: {
  label: string;
  children: React.ReactNode;
  trend: number;
}) {
  return (
    <div className="bg-bisque-50/25 rounded-xl p-4 flex-1 flex flex-col justify-center gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-gilroy-light">{label}</span>
        <button className="text-gray-400 hover:text-gray-600" aria-label="Options">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        <TrendBadge trend={trend} />
      </div>
    </div>
  );
}

export default function PanelPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(ZERO_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      try {
        const result = await fetchPanelMetrics();

        if (result) {
          setMetrics({
            totalSpent:
              typeof result.totalSpend === "number" ? result.totalSpend : 0,
            totalImpressions:
              typeof result.totalImpressions === "number"
                ? result.totalImpressions
                : 0,
            costPerConversion: {
              value: typeof result.cpa === "number" ? result.cpa : 0,
              trend: result.cpaTrend ?? 35.7,
            },
            costPerClick: {
              value: typeof result.cpc === "number" ? result.cpc : 0,
              trend: result.cpcTrend ?? 35.7,
            },
            clickThroughRate: {
              meta:
                typeof result.byPlatform?.meta?.ctr === "number"
                  ? result.byPlatform.meta.ctr
                  : 0,
              tiktok:
                typeof result.byPlatform?.tiktok?.ctr === "number"
                  ? result.byPlatform.tiktok.ctr
                  : 0,
              trend: result.ctrTrend ?? 35.7,
            },
            audienceReception: {
              value:
                typeof result.audienceReception === "string"
                  ? result.audienceReception
                  : "0",
              trend: result.audienceTrend ?? 35.7,
            },
            impressionsByPlatform: {
              meta: result.impressionsByPlatform?.meta ?? 0,
              instagram: result.impressionsByPlatform?.instagram ?? 0,
              tiktok: result.impressionsByPlatform?.tiktok ?? 0,
            },
            campaigns: {
              active: result.campaigns?.active ?? 0,
              paused: result.campaigns?.paused ?? 0,
              suspended: result.campaigns?.suspended ?? 0,
              drafts: result.campaigns?.drafts ?? 0,
            },
            topCampaign: {
              name: result.topCampaign?.name ?? "—",
              metricLabel:
                result.topCampaign?.metricLabel ?? "Cost per Conversion/CPA",
              trend: result.topCampaign?.trend ?? 0,
            },
            campaignHealth: result.campaignHealth ?? "—",
          });
        } else {
          setMetrics(ZERO_METRICS);
        }
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
        setMetrics(ZERO_METRICS);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardMetrics();
  }, []);

  const hasData =
    metrics.totalSpent > 0 ||
    metrics.totalImpressions > 0 ||
    metrics.campaigns.active > 0 ||
    metrics.campaigns.paused > 0 ||
    metrics.campaigns.suspended > 0 ||
    metrics.campaigns.drafts > 0;

  return (
    <PanelLayout>
      <div className="p-4 bg-[#f2f2f2] min-h-full">
        <div className="bg-white rounded-xl p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-2rem)]">
          <DashboardHeader />

          {isLoading ? null : !hasData ? (
            <DashboardEmptyState />
          ) : (
            <>
          {/* Row 1: Spending chart + side metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <PerformanceChart totalSpent={formatCurrency(metrics.totalSpent)} />
            </div>

            <div className="flex flex-col gap-4">
              <SideMetricCard
                label="Cost per Conversion/CPA"
                trend={metrics.costPerConversion.trend}
              >
                <span className="text-2xl text-firebrick-500 font-gilroy-semibold">
                  {formatCurrency(metrics.costPerConversion.value)}
                </span>
              </SideMetricCard>

              <SideMetricCard
                label="Cost Per Click (CPC)"
                trend={metrics.costPerClick.trend}
              >
                <span className="text-2xl text-firebrick-500 font-gilroy-semibold">
                  {formatCurrency(metrics.costPerClick.value)}
                </span>
              </SideMetricCard>

              <SideMetricCard
                label="Audience Reception"
                trend={metrics.audienceReception.trend}
              >
                <Users className="w-7 h-7 text-firebrick-500" />
                <span className="text-2xl text-firebrick-500 font-gilroy-semibold">
                  {metrics.audienceReception.value}
                </span>
              </SideMetricCard>
            </div>
          </div>

          {/* Row 2: CTR + Impressions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Click-Through Rate */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#4d4d4d] font-gilroy-regular">
                  Click-Through Rate
                </span>
                <button className="text-gray-400 hover:text-gray-600" aria-label="Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 pr-4 border-r border-lavender-50">
                  <MetaIcon className="w-4 h-4" />
                  <span className="text-xl text-[#556ae1] font-gilroy-medium">
                    {metrics.clickThroughRate.meta}%
                  </span>
                  <TrendBadge trend={metrics.clickThroughRate.trend} />
                </div>
                <div className="flex items-center gap-2 pr-4 border-r border-lavender-50">
                  <TikTokIcon className="w-4 h-4 text-[#4e5673]" />
                  <span className="text-xl text-[#4e5673] font-gilroy-medium">
                    {metrics.clickThroughRate.tiktok}%
                  </span>
                  <TrendBadge trend={metrics.clickThroughRate.trend} />
                </div>
              </div>

              <CTRLineChart />
            </div>

            {/* Total Impressions */}
            <div className="bg-[#f9faff] rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#4d4d4d] font-gilroy-regular">
                  Total Impressions
                </span>
                <button className="text-gray-400 hover:text-gray-600" aria-label="Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="text-2xl md:text-[28px] text-gray-800 font-gilroy-semibold mb-6">
                {formatNumber(metrics.totalImpressions)}
              </div>

              <DonutChart
                meta={metrics.impressionsByPlatform.meta}
                instagram={metrics.impressionsByPlatform.instagram}
                tiktok={metrics.impressionsByPlatform.tiktok}
              />
            </div>
          </div>

          {/* Row 3: Campaigns summary + top performer + performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CampaignsSummaryCard breakdown={metrics.campaigns} />

            <div className="flex flex-col gap-4">
              <TopPerformingCard
                campaignName={metrics.topCampaign.name}
                metricLabel={metrics.topCampaign.metricLabel}
                trend={metrics.topCampaign.trend}
              />
              <CampaignPerformanceCard status={metrics.campaignHealth} />
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
