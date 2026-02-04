"use client";

import { useEffect, useMemo, useState } from "react";
import { PanelLayout } from "../components/panel-layout";
import { CampaignsSidebar } from "../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../components/campaigns-mobile-header";
import { CampaignsTable } from "../components/campaigns-table";
import { ScheduledCampaignsCard } from "../components/scheduled-campaigns-card";
import { SuspendedCampaignsTable } from "../components/suspended-campaigns-table";
import { Campaign, mockCampaigns, formatCurrency } from "@/lib/mock-data";
import { fetchCampaigns } from "@/lib/campaigns";
import { Search, Plus, FilePlus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

const utcDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<
    "active" | "suspended" | "scheduled"
  >("active");

  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchCampaigns();

        const mapped: Campaign[] = (data ?? []).map((c) => {
          const createdAt = c.createdAt ? new Date(c.createdAt) : null;
          const started = createdAt ? utcDateFormatter.format(createdAt) : "-";

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
        setCampaigns(mockCampaigns);
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Total Amount Spent */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/dollar-sign.png" alt="dollar-alt" />
                  <div>
                    <div className="text-sm text-gray-400">
                      Total Amount Spent
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(12350987.67)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Health */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-3">
                  Campaign Health
                </div>
                <button className="px-6 py-2 bg-bisque-50 text-firebrick-500 rounded-xl font-medium flex items-center gap-2 hover:bg-bisque-100 transition-colors font-gilroy-bold">
                  <img src="/mdi_fire.png" alt="fire-alt" />
                  Budget Burn
                </button>
              </div>
            </div>

            {loadError && (
              <div className="mb-4 text-sm text-red-600">{loadError}</div>
            )}

            {isLoading && (
              <div className="mb-4 text-sm text-gray-500">
                Loading campaigns…
              </div>
            )}

            {/* Action Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {/* Search */}
                <div className="relative hidden sm:flex flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-between sm:justify-end flex-1">
                  <Link
                    href="/panel/campaigns/new"
                    className="px-5 py-2.5 bg-khaki-200 text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-khaki-300 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    New campaign
                  </Link>
                  <button className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hidden sm:flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <FilePlus className="w-5 h-5" />
                    Add metric
                  </button>
                  <button className="px-5 py-2.5 sm:border sm:border-gray-300 bg-white text-peru-200 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="relative flex-1 max-w-md mt-4 sm:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Render based on tab */}
            {activeTab === "scheduled" ? (
              <ScheduledCampaignsCard campaigns={displayedCampaigns} />
            ) : activeTab === "suspended" ? (
              <SuspendedCampaignsTable campaigns={displayedCampaigns} />
            ) : (
              <CampaignsTable campaigns={displayedCampaigns} />
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
