"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
import { PanelLayout } from "./components/panel-layout";
import { DashboardTopBar } from "./components/dashboard-top-bar";
import { LifetimeStatCard } from "./components/lifetime-stat-card";
import { PerformanceChart } from "./components/performance-chart";
import { RecentCampaignsCard } from "./components/recent-campaigns-card";
import {
  ClickThroughRateCard,
  type RateMetric,
} from "./components/click-through-rate-card";
import { DonutChart } from "./components/donut-chart";
import { DashboardEmptyState } from "./components/dashboard-empty-state";
import { DashboardAiBar } from "./components/dashboard-ai-bar";
import {
  DashboardAiPanel,
  type AiMessage,
} from "./components/dashboard-ai-panel";
import {
  fetchPanelMetrics,
  type PanelCurrencyMetrics,
  type PanelMetrics,
  type PanelPlatform,
  type PanelPlatformMetrics,
  type SpendByCurrency,
} from "@/lib/panel";
import {
  fetchCampaigns,
  requestCampaignAdvice,
  type CampaignDto,
} from "@/lib/campaigns";

const RECENT_CAMPAIGN_LIMIT = 7;

const formatNumber = (value: number) =>
  Math.trunc(Number.isFinite(value) ? value : 0).toLocaleString("en-US");

/** A figure with no source reads as an em dash so no number is invented. */
const orDash = (value: number | undefined, format: (n: number) => string) =>
  typeof value === "number" && Number.isFinite(value) ? format(value) : "—";

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

/** Ad accounts on different currencies never sum, so each is shown in full. */
const formatSpend = (spend: SpendByCurrency[]) =>
  spend.length === 0
    ? "—"
    : spend
        .map(({ currency, amount }) => formatMoney(amount, currency))
        .join(" + ");

/**
 * Return on ad spend is a ratio of two amounts in the same currency, so it
 * carries no symbol. Each currency keeps its own ratio.
 */
const formatRoas = (byCurrency: PanelCurrencyMetrics[]) => {
  const rated = byCurrency.filter(
    (row): row is PanelCurrencyMetrics & { roas: number } => row.roas !== null,
  );
  if (rated.length === 0) return "—";
  return rated
    .map((row) =>
      rated.length > 1
        ? `${row.roas.toFixed(2)}× ${row.currency}`
        : `${row.roas.toFixed(2)}×`,
    )
    .join(" · ");
};

const formatPlatformRoas = (stats: PanelPlatformMetrics | undefined) => {
  if (!stats) return "—";
  const spend = stats.spendByCurrency;
  if (spend.length !== 1 || spend[0].amount <= 0) return "—";
  const revenue = stats.revenueByCurrency.find(
    (entry) => entry.currency === spend[0].currency,
  );
  if (!revenue) return "—";
  return `${(revenue.amount / spend[0].amount).toFixed(2)}×`;
};

const EMPTY_METRICS: PanelMetrics = {
  spendByCurrency: [],
  revenueByCurrency: [],
  byCurrency: [],
  totalImpressions: 0,
  totalClicks: 0,
  totalConversions: 0,
  totalReach: 0,
  ctr: 0,
  byPlatform: {},
  dailySpend: [],
};

export default function PanelPage() {
  const [metrics, setMetrics] = useState<PanelMetrics>(EMPTY_METRICS);
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const assistantRequestRef = useRef(0);
  const selectedCampaignRef = useRef(selectedCampaignId);

  useEffect(() => {
    selectedCampaignRef.current = selectedCampaignId;
    assistantRequestRef.current += 1;
    setAssistantLoading(false);
  }, [selectedCampaignId]);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      const [metricsResult, campaignsResult] = await Promise.allSettled([
        fetchPanelMetrics(),
        fetchCampaigns(),
      ]);
      if (!active) return;

      if (campaignsResult.status === "fulfilled") {
        setCampaigns(
          campaignsResult.value.map(({ id, name }) => ({ id, name })),
        );
        setRecentCampaigns(
          campaignsResult.value
            .filter((campaign) => campaign.publishedAt)
            .sort(
              (a, b) =>
                Date.parse(b.publishedAt ?? "") -
                Date.parse(a.publishedAt ?? ""),
            )
            .slice(0, RECENT_CAMPAIGN_LIMIT),
        );
      } else {
        setAssistantError(
          campaignsResult.reason instanceof Error
            ? campaignsResult.reason.message
            : "Could not load campaigns for the assistant.",
        );
      }

      if (metricsResult.status === "fulfilled") {
        setMetrics(metricsResult.value ?? EMPTY_METRICS);
      } else {
        console.error("Error loading dashboard metrics:", metricsResult.reason);
        setMetrics(EMPTY_METRICS);
      }
      setIsLoading(false);
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const sendAssistantMessage = async (text: string) => {
    if (!selectedCampaignId || assistantLoading) {
      if (!selectedCampaignId) setAssistantError("Select a campaign first.");
      return;
    }

    const requestCampaignId = selectedCampaignId;
    const requestId = assistantRequestRef.current + 1;
    assistantRequestRef.current = requestId;
    const userMessage: AiMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text,
    };
    setMessages((current) => [...current, userMessage]);
    setAssistantOpen(true);
    setAssistantLoading(true);
    setAssistantError(null);

    try {
      const response = await requestCampaignAdvice(
        requestCampaignId,
        text,
        messages.map((message) => ({
          role: message.sender === "user" ? "user" : "assistant",
          content: message.text,
        })),
      );
      if (
        assistantRequestRef.current !== requestId ||
        selectedCampaignRef.current !== requestCampaignId
      ) {
        return;
      }
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), sender: "ai", text: response.answer },
      ]);
    } catch (failure) {
      if (
        assistantRequestRef.current !== requestId ||
        selectedCampaignRef.current !== requestCampaignId
      ) {
        return;
      }
      setAssistantError(
        failure instanceof Error
          ? failure.message
          : "The campaign assistant could not answer right now.",
      );
    } finally {
      if (assistantRequestRef.current === requestId) {
        setAssistantLoading(false);
      }
    }
  };

  const platforms = metrics.byPlatform;

  // Cost per action is money. It only resolves to one figure while every ad
  // account bills in the same currency.
  const soleCurrency =
    metrics.byCurrency.length === 1 ? metrics.byCurrency[0] : null;

  const formatRate = (metric: RateMetric, value: number | undefined) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return "—";
    if (metric === "cpa") {
      return soleCurrency ? formatMoney(value, soleCurrency.currency) : "—";
    }
    if (metric === "roas") return `${value.toFixed(2)}×`;
    if (metric === "ctr") return `${Number(value.toFixed(1))}%`;
    return formatNumber(value);
  };

  // One bar scale cannot hold two currencies, so the chart only plots when
  // every ad account bills in the same one.
  const spendPoints = soleCurrency
    ? metrics.dailySpend.map((day) => ({
        date: new Intl.DateTimeFormat("en-GB").format(new Date(day.date)),
        meta:
          day.byPlatform.meta?.find(
            (entry) => entry.currency === soleCurrency.currency,
          )?.amount ?? 0,
        tiktok:
          day.byPlatform.tiktok?.find(
            (entry) => entry.currency === soleCurrency.currency,
          )?.amount ?? 0,
      }))
    : [];

  const platformCpa = (platform: PanelPlatform) => {
    if (!soleCurrency) return undefined;
    const stats = platforms[platform];
    if (!stats || stats.conversions <= 0) return undefined;
    const spend = stats.spendByCurrency.find(
      (entry) => entry.currency === soleCurrency.currency,
    );
    return spend ? spend.amount / stats.conversions : undefined;
  };

  const platformRoas = (platform: PanelPlatform) => {
    const stats = platforms[platform];
    const spend = stats?.spendByCurrency;
    if (!stats || spend?.length !== 1 || spend[0].amount <= 0) return undefined;
    const revenue = stats.revenueByCurrency.find(
      (entry) => entry.currency === spend[0].currency,
    );
    return revenue ? revenue.amount / spend[0].amount : undefined;
  };

  const hasData =
    metrics.spendByCurrency.length > 0 ||
    metrics.totalImpressions > 0 ||
    recentCampaigns.length > 0;

  return (
    <PanelLayout>
      <div className="p-4 bg-[#f2f2f2] min-h-full">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <div className="min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col gap-6 rounded-xl bg-white p-4 md:flex md:p-6">
            <DashboardTopBar />

            {isLoading ? null : !hasData ? (
              <DashboardEmptyState />
            ) : (
              <>
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <h2 className="flex-1 font-inter text-base font-medium tracking-[-0.16px] text-[#333]">
                      All-time Performance
                    </h2>
                    <span className="flex items-center gap-2.5 rounded-md bg-white p-2 font-inter text-sm tracking-[-0.14px] text-[#4d4d4d]">
                      Filter by:
                      <span className="flex items-center gap-1">
                        Date
                        <ChevronDown className="size-4" aria-hidden />
                      </span>
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <LifetimeStatCard
                      label="Lifetime ROAS"
                      value={formatRoas(metrics.byCurrency)}
                      trend={0}
                      breakdown={{
                        meta: formatPlatformRoas(platforms.meta),
                        tiktok: formatPlatformRoas(platforms.tiktok),
                      }}
                    />
                    <LifetimeStatCard
                      label="Reach"
                      value={orDash(metrics.totalReach, formatNumber)}
                      trend={0}
                      breakdown={{
                        meta: orDash(platforms.meta?.reach, formatNumber),
                        tiktok: orDash(platforms.tiktok?.reach, formatNumber),
                      }}
                    />
                    <LifetimeStatCard
                      label="Conversions"
                      value={orDash(metrics.totalConversions, formatNumber)}
                      trend={0}
                      breakdown={{
                        meta: orDash(platforms.meta?.conversions, formatNumber),
                        tiktok: orDash(
                          platforms.tiktok?.conversions,
                          formatNumber,
                        ),
                      }}
                      showAssistantHint
                    />
                  </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_298px]">
                  <PerformanceChart
                    data={spendPoints}
                    totalSpent={formatSpend(metrics.spendByCurrency)}
                    unplottableReason={
                      soleCurrency || metrics.byCurrency.length === 0
                        ? undefined
                        : "Your ad accounts bill in more than one currency, so daily spend is listed above rather than charted."
                    }
                  />
                  <RecentCampaignsCard
                    campaigns={recentCampaigns.map((campaign) => ({
                      id: campaign.id,
                      name: campaign.name,
                      publishedAt: campaign.publishedAt ?? null,
                    }))}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <ClickThroughRateCard
                    totals={{
                      ctr: metrics.ctr,
                      clicks: metrics.totalClicks,
                      conversions: metrics.totalConversions,
                      cpa: soleCurrency?.cpa,
                      roas: soleCurrency?.roas ?? undefined,
                    }}
                    trend={0}
                    byPlatform={platforms}
                    formatMetric={formatRate}
                    platformCpa={platformCpa}
                    platformRoas={platformRoas}
                  />

                  <div className="rounded-xl border border-lavender-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm font-bold tracking-[-0.14px] text-[#333]">
                        Total Impressions
                      </span>
                      <button
                        type="button"
                        className="text-lavender-200 transition-colors hover:text-[#333]"
                        aria-label="Impression options"
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </button>
                    </div>

                    <p className="mt-2 font-lexend text-2xl md:text-[28px] text-[#333]">
                      {orDash(metrics.totalImpressions, formatNumber)}
                    </p>

                    <DonutChart
                      meta={platforms.meta?.impressions ?? 0}
                      tiktok={platforms.tiktok?.impressions ?? 0}
                    />
                  </div>
                </div>
              </>
            )}

            {hasData && !assistantOpen && (
              <DashboardAiBar
                campaigns={campaigns}
                selectedCampaignId={selectedCampaignId}
                onSelectCampaign={(campaignId) => {
                  if (campaignId !== selectedCampaignId) setMessages([]);
                  setSelectedCampaignId(campaignId);
                  setAssistantError(null);
                }}
                onSend={(text) => void sendAssistantMessage(text)}
                loading={assistantLoading}
                error={assistantError}
              />
            )}
          </div>
          {assistantOpen && (
            <DashboardAiPanel
              messages={messages}
              onSend={(text) => void sendAssistantMessage(text)}
              onClose={() => setAssistantOpen(false)}
              loading={assistantLoading}
              error={assistantError}
            />
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
