"use client";

import { useEffect, useMemo, useState } from "react";
import { PanelLayout } from "../components/panel-layout";
import { CampaignsSidebar } from "../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../components/campaigns-mobile-header";
import { ScheduledCampaignsCard } from "../components/scheduled-campaigns-card";
import { SuspendedCampaignsTable } from "../components/suspended-campaigns-table";
import { Campaign } from "@/lib/mock-data";
import { fetchCampaigns, fetchCampaignMetrics } from "@/lib/campaigns";
import {
  Search,
  Plus,
  SlidersHorizontal,
  List,
  ChevronDown,
} from "lucide-react";
import {
  CampaignCard,
  type CampaignCardData,
} from "../components/campaign-card";
import Link from "next/link";

const MOCK_METRICS = {
  amount: "N12,350,987.67",
  ctr: "35.7%",
  cpc: "N350.89",
  cost: "N1,300.80",
  priority: "High priority",
};

const TOP_PERFORMING: CampaignCardData[] = Array.from({ length: 3 }, (_, i) => ({
  id: `top-${i}`,
  name: "Growdex One Up",
  status: "Fabulous run!",
  variant: "top",
  ...MOCK_METRICS,
}));

const ALL_CAMPAIGNS: CampaignCardData[] = Array.from({ length: 6 }, (_, i) => ({
  id: `all-${i}`,
  name: "Growdex One Up",
  status: "Budget Burn",
  variant: "burn",
  ...MOCK_METRICS,
}));

const utcDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatCurrency = (amount: number): string => {
  return `N${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<
    "active" | "suspended" | "scheduled"
  >("active");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Fetch campaigns and metrics concurrently, but don't let metrics failure block campaigns
        const [campaignsResult, metricsResult] = await Promise.allSettled([
          fetchCampaigns(),
          fetchCampaignMetrics(),
        ]);

        if (campaignsResult.status === "rejected") {
          throw campaignsResult.reason;
        }
        const campaignsData = campaignsResult.value;

        if (
          isMounted &&
          metricsResult.status === "fulfilled" &&
          metricsResult.value.summary
        ) {
          setTotalSpend(metricsResult.value.summary.totalSpend);
        }

        const mapped: Campaign[] = (campaignsData ?? []).map((c) => {
          const createdAt = c.createdAt ? new Date(c.createdAt) : null;
          const started =
            createdAt && !Number.isNaN(createdAt.getTime())
              ? utcDateFormatter.format(createdAt)
              : "-";
          const backendStatus = String(c.status ?? "draft").toLowerCase();
          const status: Campaign["status"] =
            backendStatus === "active"
              ? "active"
              : backendStatus === "paused"
                ? "paused"
                : backendStatus === "suspended"
                  ? "suspended"
                  : "scheduled";

          return {
            id: c.id,
            name: c.name,
            platforms: c.platforms ?? [],
            started,
            impressions: 0,
            reach: { min: 0, max: 0 },
            ctr: 0,
            ctrTrend: 0,
            status,
            goal: c.goal,
          };
        });

        if (isMounted) setCampaigns(mapped);
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load");
        setCampaigns([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  const { activeCampaigns, suspendedCampaigns, scheduledCampaigns } = useMemo(
    () => ({
      activeCampaigns: campaigns.filter((c) => c.status === "active"),
      suspendedCampaigns: campaigns.filter(
        (c) => c.status === "suspended" || c.status === "paused",
      ),
      scheduledCampaigns: campaigns.filter((c) => c.status === "scheduled"),
    }),
    [campaigns],
  );

  const displayedCampaigns =
    activeTab === "active"
      ? activeCampaigns
      : activeTab === "suspended"
        ? suspendedCampaigns
        : scheduledCampaigns;

  return (
    <PanelLayout>
      <div className="flex h-screen">
        {/* Secondary Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <CampaignsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto hide-scrollbar flex flex-col">
          {/* Mobile Header */}
          <CampaignsMobileHeader />

          <div className="flex-1 overflow-auto hide-scrollbar p-4 md:p-8">
            {/* Page Header - Hidden on mobile */}
            <h1 className="hidden md:block text-3xl font-bold text-gray-900 mb-8">
              Campaigns
            </h1>

            {/* Status Tabs */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 bg-lavender-50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "active"
                    ? "bg-khaki-200 text-gray-900 shadow-lg"
                    : "bg-transparent text-gray-600"
                } cursor-pointer`}
              >
                Active{" "}
                <span
                  className={`ml-2 px-2 py-1 hidden md:inline rounded-full ${
                    activeTab === "active"
                      ? "bg-yellow-50"
                      : "bg-peru-200 text-white"
                  }`}
                >
                  {activeCampaigns.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("suspended")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "suspended"
                    ? "bg-khaki-200 text-gray-900 shadow-lg"
                    : "bg-transparent text-gray-600"
                } cursor-pointer`}
              >
                Suspended{" "}
                <span
                  className={`ml-2 px-2 hidden md:inline py-1 rounded-full ${
                    activeTab === "suspended"
                      ? "bg-yellow-50"
                      : "bg-peru-200 text-white"
                  }`}
                >
                  {suspendedCampaigns.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "scheduled"
                    ? "bg-khaki-200 text-gray-900 shadow-lg"
                    : "bg-transparent text-gray-600"
                } cursor-pointer`}
              >
                Scheduled{" "}
                <span
                  className={`ml-2 px-2 py-1 hidden md:inline rounded-full ${
                    activeTab === "scheduled"
                      ? "bg-yellow-50"
                      : "bg-peru-200 text-white"
                  }`}
                >
                  {scheduledCampaigns.length}
                </span>
              </button>
            </div>

            {/* Summary header */}
            {activeTab === "active" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg border border-khaki-200 bg-yellow-50 flex items-center justify-center">
                      <img src="/cash.png" alt="" className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">
                        Total Amount Spent
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {totalSpend ? formatCurrency(totalSpend) : MOCK_METRICS.amount}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Campaign Health
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-bisque-50 px-3 py-1.5 text-sm font-medium text-firebrick-500">
                      <img src="/mdi_fire.png" alt="" className="w-4 h-4" />
                      Budget Burn
                    </span>
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                  <List className="w-4 h-4" />
                  Switch to list view
                </button>
              </div>
            )}

            {loadError && (
              <div className="mb-4 text-sm text-red-600">{loadError}</div>
            )}

            {isLoading && (
              <div className="mb-4 text-sm text-gray-500">
                Loading campaigns…
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full rounded-full bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-khaki-200"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="accent-khaki-300" />
                  Select all
                </label>

                <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                  Bulk action
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 text-sm font-medium text-peru-200 hover:text-peru-200/80">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filter
                </button>
                <Link
                  href="/panel/campaigns/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 hover:bg-khaki-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create campaign
                </Link>
              </div>
            </div>

            {/* Render based on tab */}
            {activeTab === "scheduled" ? (
              <ScheduledCampaignsCard campaigns={displayedCampaigns} />
            ) : activeTab === "suspended" ? (
              <SuspendedCampaignsTable campaigns={displayedCampaigns} />
            ) : (
              <div className="space-y-8">
                {/* Top Performing */}
                <section>
                  <h2 className="text-sm font-semibold text-green-600 mb-3">
                    Top Performing
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOP_PERFORMING.map((c) => (
                      <CampaignCard key={c.id} data={c} />
                    ))}
                  </div>
                </section>

                {/* All Campaigns */}
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 mb-3">
                    All Campaigns
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ALL_CAMPAIGNS.map((c) => (
                      <CampaignCard key={c.id} data={c} />
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
