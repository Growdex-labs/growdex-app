"use client";

import { useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../../components/campaigns-mobile-header";
import { CampaignsTable } from "../../components/campaigns-table";
import { mockCampaigns } from "@/lib/mock-data";
import {
  Search,
  FilePlus,
  SlidersHorizontal,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function TrashedCampaignsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock thrashed campaigns
  const trashedCampaigns = mockCampaigns
    .filter((c) => c.status === "suspended" || c.status === "paused")
    .slice(0, 1);

  const daysUntilPermanentDelete = 30;
  const daysLeft = Math.floor(Math.random() * 25) + 1;

  return (
    <PanelLayout>
      <div>
        <div className="flex h-screen">
          {/* Secondary Sidebar - Hidden on mobile */}
          <div className="hidden md:block">
            <CampaignsSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto hide-scrollbar flex flex-col">
            {/* Mobile Header */}
            <CampaignsMobileHeader />

            <div className="flex-1 overflow-auto hide-scrollbar p-4">
              {/* Alert Banner */}
              {trashedCampaigns.length > 0 && (
                <div className="mb-6 bg-slate-200/40 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-[#AD9D37] flex-shrink-0 " />
                  <p className="text-sm">
                    Campaigns in trash are permanently deleted after{" "}
                    {daysUntilPermanentDelete} days
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div className="mb-6 bg-white space-y-4 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="relative hidden sm:flex gap-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />

                    <div className="flex gap-px whitespace-nowrap items-center">
                      <input type="checkbox" className="" name="" id="" />
                      <span className="text-sm text-gray-600 ml-1">
                        Select all
                      </span>
                    </div>

                    <div>
                      <select name="filter" id="filter"></select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-between sm:justify-end flex-1">
                    <button className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-medium hidden sm:flex items-center gap-2 hover:bg-gray-50 transition-colors">
                      <FilePlus className="w-5 h-5" />
                      Add metric
                    </button>
                    <button className="px-5 py-2.5 bg-white text-peru-200 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
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

                {/* Content */}
                {trashedCampaigns.length > 0 ? (
                  <>
                    <CampaignsTable campaigns={trashedCampaigns} />

                    {/* Permanent Delete Section */}
                    <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-900 mb-2">
                            Permanently Delete Selected
                          </h3>
                          <p className="text-sm text-red-700 mb-4">
                            This action cannot be undone. Permanently deleted
                            campaigns cannot be recovered.
                          </p>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Permanently
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Trash2 className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Thrashed Campaigns
                    </h3>
                    <p className="text-gray-600 text-center">
                      Your thrashed campaigns will appear here. <br />
                      Deleted campaigns are permanently removed after 30 days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-800/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Permanently Delete Campaigns?
                  </h2>
                  <p className="text-gray-600 text-sm mt-2">
                    This action cannot be undone. All data associated with these
                    campaigns will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
