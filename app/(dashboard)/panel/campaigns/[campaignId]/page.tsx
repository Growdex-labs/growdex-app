"use client";

import { mockCampaigns, getAdsByCampaignId } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import { CampaignHeader } from "./components/campaign-header";
import { PenBoxIcon, PlusIcon } from "lucide-react";
import CreateAdLayout from "../../components/create-ad/create-ad-layout";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
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
            <CampaignHeader campaign={campaign} />

            {/* Ad tabs */}
            <div className="mb-6 bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                {/* Overview Tab */}
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                    activeTab === "overview"
                      ? "bg-gray-200 text-gray-900"
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
      </div>
    </PanelLayout>
  );
}
