"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/context/me-context";
import { proDisabledReason } from "@/lib/billing";
import { MoreVertical } from "lucide-react";
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
  takeAdviceAction,
  withAdviceActionState,
} from "./components/take-advice-action";
import {
  RecommendedActions,
  type InsightActionId,
} from "./components/recommended-actions";
import {
  buildDashboardInsights,
  insightMessageText,
} from "@/lib/dashboard-insights";
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
  const router = useRouter();
  const { me } = useMe();
  const assistantDisabledReason = proDisabledReason(me);
  const [metrics, setMetrics] = useState<PanelMetrics>(EMPTY_METRICS);
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [view, setView] = useState<"default" | "insights">("default");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [selectedInsightAction, setSelectedInsightAction] =
    useState<InsightActionId | null>(null);
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
    if (!selectedCampaignId || assistantLoading || assistantDisabledReason) {
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
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: response.answer,
          actions: response.actions,
        },
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

  // The last full 14-day window against the one before it, from the API.
  const trendSummary = metrics.trendSummary;
  const trendFor = (key: keyof NonNullable<typeof trendSummary>["change"]) => {
    const value = trendSummary?.change?.[key];
    return typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : 0;
  };
  const currencyTrend = (list?: Array<{ currency: string; change: number | null }>) => {
    const entry = list?.find(
      (candidate) => candidate.currency === soleCurrency?.currency,
    );
    return typeof entry?.change === "number" && Number.isFinite(entry.change)
      ? Math.round(entry.change)
      : 0;
  };
  // ROAS moves with revenue and spend together: (1+r%)/(1+s%) - 1.
  const roasTrend = (() => {
    const revenue = currencyTrend(trendSummary?.revenueChangeByCurrency);
    const spend = currencyTrend(trendSummary?.spendChangeByCurrency);
    if (!revenue && !spend) return 0;
    const ratio =
      (1 + revenue / 100) / (spend === -100 ? NaN : 1 + spend / 100);
    return Number.isFinite(ratio) ? Math.round((ratio - 1) * 100) : 0;
  })();

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

  const openInsights = () => {
    setView("insights");
    setAssistantOpen(true);
    setSelectedInsightAction(null);
    setMessages((current) =>
      current.length
        ? current
        : [
            {
              id: crypto.randomUUID(),
              sender: "ai",
              text: insightMessageText(buildDashboardInsights(metrics)),
            },
          ],
    );
  };

  const closeInsights = () => {
    setView("default");
    setAssistantOpen(false);
    setSelectedInsightAction(null);
  };

  const rateCard = (
    <ClickThroughRateCard
      totals={{
        ctr: metrics.ctr,
        clicks: metrics.totalClicks,
        conversions: metrics.totalConversions,
        cpa: soleCurrency?.cpa,
        roas: soleCurrency?.roas ?? undefined,
      }}
      trend={trendFor("ctr")}
      byPlatform={platforms}
      formatMetric={formatRate}
      platformCpa={platformCpa}
      platformRoas={platformRoas}
      dailyTrend={metrics.dailyTrend}
      expanded={view === "insights"}
      onExpand={view === "default" ? openInsights : undefined}
    />
  );

  return (
    <PanelLayout>
      <div className="min-h-full bg-[#f2f2f2] p-2 sm:p-4">
        <div className="flex min-w-0 flex-col items-stretch gap-4 lg:flex-row lg:items-start">
          <div className="flex min-h-full min-w-0 flex-1 flex-col gap-5 rounded-xl bg-white p-4 sm:gap-6 md:p-6">
            <DashboardTopBar
              variant={view}
              onSwitchToDefault={closeInsights}
            />

            {isLoading ? null : !hasData ? (
              <DashboardEmptyState />
            ) : view === "insights" ? (
              <>
                {rateCard}
                {!selectedCampaignId && (
                  <p className="mt-4 text-sm text-gray-500">
                    Select a campaign from the dashboard to use a recommended action.
                  </p>
                )}
                <RecommendedActions
                  selectedId={selectedInsightAction}
                  disabled={assistantLoading || !selectedCampaignId}
                  onSelect={(action) => {
                    setSelectedInsightAction(action.id);
                    void sendAssistantMessage(action.prompt);
                  }}
                />
              </>
            ) : (
              <>
                <section className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <h2 className="flex-1 font-gilroy-medium text-base tracking-[-0.16px] text-[#333]">
                      All-time Performance
                    </h2>
                    <span className="flex items-center gap-2.5 rounded-md bg-white py-1 font-gilroy-regular text-xs tracking-[-0.14px] text-[#4d4d4d] sm:p-2 sm:text-sm">
                      Trend: last {trendSummary?.windowDays ?? 14} days vs the{" "}
                      {trendSummary?.windowDays ?? 14} before
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                    <LifetimeStatCard
                      label="Lifetime ROAS"
                      value={formatRoas(metrics.byCurrency)}
                      trend={roasTrend}
                      breakdown={{
                        meta: formatPlatformRoas(platforms.meta),
                        tiktok: formatPlatformRoas(platforms.tiktok),
                      }}
                    />
                    <LifetimeStatCard
                      label="Reach"
                      value={orDash(metrics.totalReach, formatNumber)}
                      trend={trendFor("reach")}
                      breakdown={{
                        meta: orDash(platforms.meta?.reach, formatNumber),
                        tiktok: orDash(platforms.tiktok?.reach, formatNumber),
                      }}
                    />
                    <LifetimeStatCard
                      label="Conversions"
                      value={orDash(metrics.totalConversions, formatNumber)}
                      trend={trendFor("conversions")}
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

                  {(metrics.totalVideoViews ?? 0) +
                    (metrics.totalEngagements ?? 0) +
                    (metrics.totalLeads ?? 0) +
                    (metrics.totalPurchases ?? 0) >
                    0 && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                      {(metrics.totalVideoViews ?? 0) > 0 && (
                        <LifetimeStatCard
                          label="Video views"
                          value={orDash(metrics.totalVideoViews, formatNumber)}
                          trend={0}
                          breakdown={{
                            meta: orDash(platforms.meta?.videoViews, formatNumber),
                            tiktok: orDash(
                              platforms.tiktok?.videoViews,
                              formatNumber,
                            ),
                          }}
                        />
                      )}
                      {(metrics.totalEngagements ?? 0) > 0 && (
                        <LifetimeStatCard
                          label="Engagements"
                          value={orDash(metrics.totalEngagements, formatNumber)}
                          trend={0}
                          breakdown={{
                            meta: orDash(
                              platforms.meta?.engagements,
                              formatNumber,
                            ),
                            tiktok: orDash(
                              platforms.tiktok?.engagements,
                              formatNumber,
                            ),
                          }}
                        />
                      )}
                      {(metrics.totalLeads ?? 0) > 0 && (
                        <LifetimeStatCard
                          label="Leads"
                          value={orDash(metrics.totalLeads, formatNumber)}
                          trend={0}
                          breakdown={{
                            meta: orDash(platforms.meta?.leads, formatNumber),
                            tiktok: orDash(platforms.tiktok?.leads, formatNumber),
                          }}
                        />
                      )}
                      {(metrics.totalPurchases ?? 0) > 0 && (
                        <LifetimeStatCard
                          label="Purchases"
                          value={orDash(metrics.totalPurchases, formatNumber)}
                          trend={0}
                          breakdown={{
                            meta: orDash(
                              platforms.meta?.purchases,
                              formatNumber,
                            ),
                            tiktok: orDash(
                              platforms.tiktok?.purchases,
                              formatNumber,
                            ),
                          }}
                        />
                      )}
                    </div>
                  )}
                </section>

                <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_298px] xl:gap-6">
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

                <div className="grid gap-4 md:grid-cols-2 xl:gap-6">
                  {rateCard}

                  <div className="rounded-xl border border-lavender-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-gilroy-bold text-sm tracking-[-0.14px] text-[#333]">
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

            {hasData && view === "default" && !assistantOpen && (
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
                disabledReason={assistantDisabledReason}
              />
            )}
          </div>
          {assistantOpen && (
            <DashboardAiPanel
              messages={messages}
              onSend={(text) => void sendAssistantMessage(text)}
              disabledReason={assistantDisabledReason}
              onClose={
                view === "insights"
                  ? closeInsights
                  : () => setAssistantOpen(false)
              }
              loading={assistantLoading}
              error={assistantError}
              onTakeAction={(message, action) => {
                if (action.type === "open") {
                  router.push(`/panel/campaigns/${action.campaignId}`);
                  return;
                }
                setMessages((current) =>
                  withAdviceActionState(current, message.id, action, "applying"),
                );
                void takeAdviceAction(action)
                  .then(() => {
                    setMessages((current) =>
                      withAdviceActionState(
                        current,
                        message.id,
                        action,
                        "applied",
                      ),
                    );
                  })
                  .catch(() => {
                    setMessages((current) =>
                      withAdviceActionState(
                        current,
                        message.id,
                        action,
                        "failed",
                      ),
                    );
                  });
              }}
            />
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
