"use client";

import { Campaign } from "@/lib/mock-data";
import { Edit2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ScheduledCampaignsCardProps {
  campaigns: Campaign[];
}

export function ScheduledCampaignsCard({
  campaigns,
}: ScheduledCampaignsCardProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === campaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(campaigns.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <div className="text-center mb-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No scheduled campaigns
          </h3>
          <p className="text-gray-500 text-sm">
            Create your first scheduled campaign to get started
          </p>
        </div>
        <Link
          href="/panel/campaigns/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-khaki-200 hover:bg-khaki-300 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create campaign
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - List with Checkboxes */}
      <div className="md:hidden space-y-4">
        {campaigns.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg">
            <Checkbox
              checked={selectedIds.size === campaigns.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm font-medium text-gray-700">
              Select all
            </span>
            {selectedIds.size > 0 && (
              <button className="ml-auto px-3 py-1 text-sm text-gray-600 hover:text-gray-900 font-medium">
                Bulk action
              </button>
            )}
          </div>
        )}

        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center gap-3 px-3 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Checkbox
              checked={selectedIds.has(campaign.id)}
              onCheckedChange={() => toggleSelect(campaign.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex flex-1 items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm mb-2">
                  {campaign.name}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    Scheduled
                  </span>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-1 items-center justify-between gap-2 text-xs">
                  <p className="text-gray-600">
                    Budget :{" "}
                    <span className="font-semibold text-gray-900">
                      ₦500,000
                    </span>
                  </p>
                  <p className="text-gray-500 text-left">
                    {campaign.started} by 8:00am
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/panel/campaigns/${campaign.id}/scheduled`);
              }}
              className="p-1.5 hover:bg-yellow-50 rounded transition-colors ml-auto"
            >
              <Edit2 className="w-4 h-4 text-yellow-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop View - Full Cards */}
      <div className="hidden md:block space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            onClick={() =>
              router.push(`/panel/campaigns/${campaign.id}/scheduled`)
            }
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {campaign.name}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    Scheduled
                  </span>
                </div>
                <span className="text-sm text-gray-600 order-4">
                  {campaign.started} by 8:00am
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Budget</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₦500,000
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/panel/campaigns/${campaign.id}`);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
