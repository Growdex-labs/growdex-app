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

type CampaignTab = "active" | "draft" | "inactive";

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<CampaignTab>("active");
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

  const displayed = groups[activeTab].filter((campaign) =>
    campaign.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const tabs: Array<{ id: CampaignTab; label: string }> = [
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
    { id: "inactive", label: "Paused / failed" },
  ];

  return (
    <PanelLayout>
      <div className="flex h-screen">
        <div className="hidden md:block"><CampaignsSidebar /></div>
        <div className="flex flex-1 flex-col overflow-auto hide-scrollbar">
          <CampaignsMobileHeader />
          <main className="flex-1 overflow-auto p-4 hide-scrollbar md:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 hidden items-center justify-between md:flex">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                  <p className="mt-1 text-sm text-gray-500">Create, review, and monitor campaigns from one place.</p>
                </div>
                <Link href="/panel/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300">
                  <Plus className="h-4 w-4" /> Create campaign
                </Link>
              </div>

              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400">Total amount spent</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 2,
                  }).format(totalSpend)}
                </p>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2 rounded-lg bg-lavender-50 p-1 sm:gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors sm:px-6 ${activeTab === tab.id ? "bg-khaki-200 text-gray-900 shadow" : "text-gray-600"}`}
                  >
                    {tab.label}
                    <span className="ml-2 hidden rounded-full bg-white/70 px-2 py-0.5 text-xs sm:inline">{groups[tab.id].length}</span>
                  </button>
                ))}
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaigns" className="w-full rounded-full bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-khaki-200" />
                </div>
                <Link href="/panel/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 md:hidden">
                  <Plus className="h-4 w-4" /> Create campaign
                </Link>
              </div>

              {loadError && <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
              {isLoading ? (
                <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">Loading campaigns…</p>
              ) : displayed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                  <h2 className="text-lg font-semibold text-gray-900">No {tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} campaigns</h2>
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
