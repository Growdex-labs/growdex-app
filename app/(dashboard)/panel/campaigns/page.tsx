"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMe } from "@/context/me-context";
import { proDisabledReason } from "@/lib/billing";
import { Plus, Search } from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { CampaignsSidebar } from "../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../components/campaigns-mobile-header";
import {
  fetchCampaigns,
  fetchCampaignMetricsById,
  fetchCampaignOptimizations,
  requestCampaignAdvice,
  summariseCampaignMetrics,
  type CampaignDto,
} from "@/lib/campaigns";
import { PUBLISHED_CAMPAIGN_STATUSES } from "@/lib/assets";
import { fetchPanelMetrics, type SpendByCurrency } from "@/lib/panel";
import {
  CampaignCard,
  type CampaignCardStats,
} from "../components/campaign-card";
import { CampaignsAiFab } from "../components/campaigns-ai-fab";
import {
  CampaignsAiPanel,
  type AiMessage,
} from "../components/campaigns-ai-panel";
import {
  takeAdviceAction,
  withAdviceActionState,
} from "../components/take-advice-action";
import { SegmentedTabs } from "../components/segmented-tabs";

type CampaignTab = "active" | "draft" | "inactive";

const TAB_ORDER: CampaignTab[] = ["active", "draft", "inactive"];

const TABS: Array<{ id: CampaignTab; label: string; emptyTitle: string }> = [
  { id: "active", label: "Active", emptyTitle: "No active campaigns" },
  { id: "draft", label: "Drafts", emptyTitle: "No draft campaigns" },
  { id: "inactive", label: "Inactive", emptyTitle: "No inactive campaigns" },
];

/**
 * Advertising accounts can bill in different currencies, so the card keeps
 * those amounts separate instead of adding unlike amounts together.
 */
const formatSpend = (spendByCurrency: SpendByCurrency[]) => {
  const validSpend = spendByCurrency.filter(
    ({ currency, amount }) =>
      /^[A-Z]{3}$/.test(currency) && Number.isFinite(amount),
  );

  if (validSpend.length === 0) return "—";

  return validSpend
    .map(({ currency, amount }) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount),
    )
    .join(" + ");
};

export default function CampaignsPage() {
  const router = useRouter();
  const { me } = useMe();
  const assistantDisabledReason = proDisabledReason(me);
  const [chosenTab, setChosenTab] = useState<CampaignTab | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [spendByCurrency, setSpendByCurrency] = useState<SpendByCurrency[]>([]);
  const [search, setSearch] = useState("");
  const [statsById, setStatsById] = useState<Record<string, CampaignCardStats>>(
    {},
  );
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const assistantRequestRef = useRef(0);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([fetchCampaigns(), fetchPanelMetrics()])
      .then(([campaignResult, metricsResult]) => {
        if (!active) return;
        if (campaignResult.status === "rejected") throw campaignResult.reason;
        setCampaigns(campaignResult.value);
        if (metricsResult.status === "fulfilled" && metricsResult.value) {
          setSpendByCurrency(metricsResult.value.spendByCurrency);
        }
      })
      .catch((failure) => {
        if (!active) return;
        setLoadError(
          failure instanceof Error ? failure.message : "Could not load campaigns.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!campaigns.length) return;
    let active = true;

    void Promise.all(
      campaigns.map(async (campaign) => {
        const currency =
          campaign.audienceStrategies[0]?.budget.currency ?? "NGN";
        const [metricsResult, optimizationResult] = await Promise.allSettled([
          fetchCampaignMetricsById(campaign.id).then((metrics) => ({
            ...summariseCampaignMetrics(metrics.byPlatform),
            trend: metrics.trend,
          })),
          PUBLISHED_CAMPAIGN_STATUSES.has(
            (campaign.status ?? "draft").toLowerCase(),
          )
            ? fetchCampaignOptimizations(campaign.id)
            : Promise.resolve(null),
        ]);

        return {
          id: campaign.id,
          stats: {
            spend:
              metricsResult.status === "fulfilled"
                ? metricsResult.value.spend
                : null,
            ctr:
              metricsResult.status === "fulfilled"
                ? metricsResult.value.ctr
                : null,
            cpc:
              metricsResult.status === "fulfilled"
                ? metricsResult.value.cpc
                : null,
            cpa:
              metricsResult.status === "fulfilled"
                ? metricsResult.value.cpa
                : null,
            trend:
              metricsResult.status === "fulfilled"
                ? metricsResult.value.trend.map((point) => point.ctr)
                : [],
            currency,
            recommendationCount:
              optimizationResult.status === "fulfilled" &&
              optimizationResult.value
                ? optimizationResult.value.proposals.length
                : 0,
          } satisfies CampaignCardStats,
        };
      }),
    ).then((rows) => {
      if (!active) return;
      setStatsById(
        Object.fromEntries(rows.map((row) => [row.id, row.stats])),
      );
    });

    return () => {
      active = false;
    };
  }, [campaigns]);

  const groups = useMemo(() => {
    const result: Record<CampaignTab, CampaignDto[]> = {
      active: [],
      draft: [],
      inactive: [],
    };
    for (const campaign of campaigns) {
      const status = (campaign.status ?? "draft").toLowerCase();
      if (status === "active") result.active.push(campaign);
      else if (["draft", "publishing", "under_review"].includes(status)) {
        result.draft.push(campaign);
      } else result.inactive.push(campaign);
    }
    return result;
  }, [campaigns]);

  // Opening on an empty tab hides the work the user came to find, so the first
  // group holding campaigns leads until they pick a tab themselves.
  const activeTab =
    chosenTab ?? TAB_ORDER.find((tab) => groups[tab].length > 0) ?? "active";

  const displayed = groups[activeTab].filter((campaign) =>
    campaign.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const recommendedCampaigns = campaigns.filter(
    (campaign) => (statsById[campaign.id]?.recommendationCount ?? 0) > 0,
  );
  const recommendationCount = recommendedCampaigns.reduce(
    (total, campaign) =>
      total + (statsById[campaign.id]?.recommendationCount ?? 0),
    0,
  );
  const sendAssistantMessage = async (text: string) => {
    if (assistantLoading || assistantDisabledReason) return;

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
        undefined,
        text,
        messages.map((message) => ({
          role: message.sender === "user" ? "user" : "assistant",
          content: message.text,
        })),
      );
      if (assistantRequestRef.current !== requestId) return;
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
      if (assistantRequestRef.current !== requestId) return;
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

  return (
    <PanelLayout>
      <div className="flex h-full">
        <div className="hidden md:block"><CampaignsSidebar /></div>
        <div className="flex flex-1 flex-col overflow-auto hide-scrollbar">
          <CampaignsMobileHeader />
          <main className="flex-1 overflow-auto p-4 hide-scrollbar md:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 hidden items-center justify-between md:flex">
                <div>
                  <h1 className="text-3xl font-gilroy-bold text-gray-900">Campaigns</h1>
                  <p className="mt-1 text-sm text-gray-500">Create, review, and monitor campaigns from one place.</p>
                </div>
                <Link href="/panel/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-medium text-gray-900 hover:bg-khaki-300">
                  <Plus className="h-4 w-4" /> Create campaign
                </Link>
              </div>

              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-dimGray">Total amount spent</p>
                <p className="mt-1 text-2xl font-gilroy-bold text-gray-900">
                  {formatSpend(spendByCurrency)}
                </p>
              </div>

              <SegmentedTabs
                className="mb-6"
                label="Campaign status"
                value={activeTab}
                onChange={setChosenTab}
                items={TABS.map((tab) => ({
                  id: tab.id,
                  label: tab.label,
                  count: groups[tab.id].length,
                }))}
              />

              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaigns" className="w-full rounded-full bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-khaki-200" />
                </div>
              </div>

              {loadError && <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
              {isLoading ? (
                <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">Loading campaigns…</p>
              ) : displayed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                  <h2 className="text-lg font-gilroy-semibold text-gray-900">{TABS.find((tab) => tab.id === activeTab)?.emptyTitle}</h2>
                  <p className="mt-2 text-sm text-gray-500">Campaigns in this state will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayed.map((campaign) => {
                    const status = (campaign.status ?? "draft").toLowerCase();
                    const canPublish = ["draft", "failed"].includes(status);
                    const canRecover = status === "rejected";
                    const href = canPublish
                      ? `/panel/campaigns/new/publish?id=${encodeURIComponent(campaign.id)}`
                      : canRecover
                        ? `/panel/campaigns/new?id=${encodeURIComponent(campaign.id)}`
                        : `/panel/campaigns/${encodeURIComponent(campaign.id)}`;
                    return (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        href={href}
                        stats={statsById[campaign.id]}
                        loading={!statsById[campaign.id]}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <CampaignsAiFab
        onClick={() => setAssistantOpen(true)}
        recommendationCount={recommendationCount}
      />
      <CampaignsAiPanel
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        messages={messages}
        onSend={(text) => void sendAssistantMessage(text)}
        loading={assistantLoading}
        error={assistantError}
        disabledReason={assistantDisabledReason}
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
                withAdviceActionState(current, message.id, action, "applied"),
              );
            })
            .catch(() => {
              setMessages((current) =>
                withAdviceActionState(current, message.id, action, "failed"),
              );
            });
        }}
      />
    </PanelLayout>
  );
}
