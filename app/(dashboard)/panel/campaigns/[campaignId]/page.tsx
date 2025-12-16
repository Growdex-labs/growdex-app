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
        <CampaignsSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <CampaignHeader
              campaign={campaign}
              onOptimizationClick={() => setIsOptimizationOpen(true)}
            />

            {/* Optimization Banner - Shows when sidebar is open */}
            {isOptimizationOpen && (
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
            )}

            {/* Ad tabs */}
            <div className="mb-6 bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                {/* Overview Tab */}
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                    activeTab === "overview"
                      ? "bg-khaki-200 text-gray-900"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                  }`}
                >
                  Overview
                </button>

                {/* Dynamic Ad Tabs */}
                {campaignAds.map((ad) => (
                  <button
                    key={ad.id}
                    onClick={() => setActiveTab(ad.id)}
                    className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                      activeTab === ad.id
                        ? "bg-gray-200 text-gray-900"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    {ad.name}
                  </button>
                ))}

                {/* Create Ad Button  */}
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-8 py-4 rounded-xl font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
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
              <div className="bg-white p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Performance</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Filter by:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                            Date
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
                                d="M19 9l-7 7-7-7"
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
                    <div className="flex items-center p-1">
                      <button
                        onClick={() => setActiveSubTab("modular")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeSubTab === "modular"
                            ? "bg-[#4E5673] text-gray-200 shadow-sm"
                            : "bg-transparent text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Modular
                      </button>
                      <button
                        onClick={() => setActiveSubTab("table")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeSubTab === "table"
                            ? "bg-[#4E5673] text-gray-200 shadow-sm"
                            : "bg-transparent text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Table
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
