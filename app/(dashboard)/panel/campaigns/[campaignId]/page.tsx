"use client";

import { mockCampaigns, getAdsByCampaignId } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import { CampaignHeader } from "./components/campaign-header";
import { OptimizationSidebar } from "./components/optimization-sidebar";
import { Overview } from "./components/overview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  BellIcon,
  PenBoxIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";
import CreateAdLayout from "../../components/create-ad/create-ad-layout";
import { CampaignsMobileHeader } from "../../components/campaigns-mobile-header";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeSubTab, setActiveSubTab] = useState<string>("modular");
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  const { campaignId } = use(params);
  const router = useRouter();

  // Find the campaign
  const campaign = mockCampaigns.find((c) => c.id === campaignId);
  const campaignAds = getAdsByCampaignId(campaignId);

  console.log(campaign);

  if (!campaign) {
    return (
      <PanelLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Campaign Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The campaign you are looking for does not exist.
            </p>
            <button
              onClick={() => router.push("/panel/campaigns")}
              className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg hover:bg-khaki-300 transition"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <div className="flex h-full">
        <div className="hidden md:block">
          <CampaignsSidebar />
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <CampaignsMobileHeader />

          <div className="p-4 sm:p-8">
            <CampaignHeader
              campaign={campaign}
              onOptimizationClick={() => setIsOptimizationOpen(true)}
            />

            {/* Optimization Banner - Shows when sidebar is open */}
            {/* {isOptimizationOpen && (
              <div className="mb-4 bg-dimYellow border border-khaki-200 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <BellIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    5 optimization opportunities located
                  </p>
                  <p className="text-xs text-khaki-300 flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3" />
                    Optimize for campaign goal
                  </p>
                </div>
                <button className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg font-semibold text-sm hover:bg-khaki-300 transition-colors">
                  See changes
                </button>
              </div>
            )} */}

            {/* Ad tabs */}
            <div className="mb-6 bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Overview Tab - Fixed */}
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-shrink-0 px-2.5 sm:px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                    activeTab === "overview"
                      ? "bg-khaki-200 text-gray-900"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                  }`}
                >
                  Overview
                </button>

                {/* Dynamic Ad Tabs - Scrollable */}
                <div className="flex-1 overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {campaignAds.map((ad) => (
                      <button
                        key={ad.id}
                        onClick={() => setActiveTab(ad.id)}
                        className={`flex-shrink-0 px-6 sm:px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                          activeTab === ad.id
                            ? "bg-gray-200 text-gray-900"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                        }`}
                      >
                        {ad.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create Ad Button - Fixed */}
                <button
                  onClick={() => setActiveTab("create")}
                  className={`flex-shrink-0 px-2.5 sm:px-8 py-4 rounded-xl font-semibold transition-colors flex items-center gap-px md:gap-2 whitespace-nowrap ${
                    activeTab === "create"
                      ? "bg-khaki-200 text-gray-900"
                      : "bg-khaki-200/80 text-gray-700 hover:bg-khaki-200"
                  }`}
                >
                  <PlusIcon className="w-5 h-5" />
                  Create ad
                </button>
              </div>
            </div>

            {/* Tab Content */}

            {activeTab === "overview" && (
              <div className="bg-white p-4 md:p-6 rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 md:mb-6">
                  <h2 className="text-base md:text-lg font-semibold">
                    Performance
                  </h2>
                  <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4">
                    {/* Filter Dropdown - Hidden label on mobile */}
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline text-sm text-gray-600">
                        Filter by:
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <span className="hidden sm:inline">Date</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                              />
                            </svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Date</DropdownMenuItem>
                          <DropdownMenuItem>Platform</DropdownMenuItem>
                          <DropdownMenuItem>Status</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* View Toggle - Icons only on mobile */}
                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 md:p-1">
                      <button
                        onClick={() => setActiveSubTab("modular")}
                        className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          activeSubTab === "modular"
                            ? "bg-[#4E5673] text-gray-200 shadow-sm"
                            : "bg-transparent text-gray-600 hover:text-gray-900"
                        }`}
                        title="Modular View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                        <span className="hidden md:inline">Modular</span>
                      </button>
                      <button
                        onClick={() => setActiveSubTab("table")}
                        className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          activeSubTab === "table"
                            ? "bg-[#4E5673] text-gray-200 shadow-sm"
                            : "bg-transparent text-gray-600 hover:text-gray-900"
                        }`}
                        title="Table View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="hidden md:inline">Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                <Overview subTab={activeSubTab} campaign={campaign} />
              </div>
            )}

            {activeTab === "create" && (
              <>
                <div className="bg-white p-6 rounded-lg flex items-center gap-4 mb-4">
                  <PenBoxIcon className="w-12 h-12 text-khaki-300" />
                  <input
                    type="text"
                    placeholder="Untitled Ad"
                    className="flex-1 border-none text-2xl p-2 focus:outline-none"
                  />
                </div>

                <div className="bg-white p-4 rounded-lg relative">
                  <CreateAdLayout />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Optimization Sidebar */}
        <OptimizationSidebar
          isOpen={isOptimizationOpen}
          onClose={() => setIsOptimizationOpen(false)}
        />
      </div>
    </PanelLayout>
  );
}
