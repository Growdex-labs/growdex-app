"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { CampaignsSidebar } from "../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../components/campaigns-mobile-header";
import {
  fetchCampaigns,
  fetchCampaignMetrics,
  type CampaignDto,
} from "@/lib/campaigns";
import { CampaignCard } from "../components/campaign-card";
import { SegmentedTabs } from "../components/segmented-tabs";

type CampaignTab = "active" | "draft" | "inactive";

const TAB_ORDER: CampaignTab[] = ["active", "draft", "inactive"];

const TABS: Array<{ id: CampaignTab; label: string; emptyTitle: string }> = [
  { id: "active", label: "Active", emptyTitle: "No active campaigns" },
  { id: "draft", label: "Drafts", emptyTitle: "No draft campaigns" },
  { id: "inactive", label: "Inactive", emptyTitle: "No inactive campaigns" },
];

export default function CampaignsPage() {
  const [chosenTab, setChosenTab] = useState<CampaignTab | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.allSettled([fetchCampaigns(), fetchCampaignMetrics()])
      .then(([campaignResult, metricsResult]) => {
        if (!active) return;
        if (campaignResult.status === "rejected") throw campaignResult.reason;
        setCampaigns(campaignResult.value);
        if (metricsResult.status === "fulfilled") {
          setTotalSpend(metricsResult.value.summary.totalSpend);
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
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 2,
                  }).format(totalSpend)}
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
                    const href = canPublish
                      ? `/panel/campaigns/new/publish?id=${encodeURIComponent(campaign.id)}`
                      : `/panel/campaigns/${encodeURIComponent(campaign.id)}`;
                    return <CampaignCard key={campaign.id} campaign={campaign} href={href} />;
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </PanelLayout>
  );
}
