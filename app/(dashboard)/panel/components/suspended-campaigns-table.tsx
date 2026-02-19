"use client";

import { Campaign } from "@/lib/mock-data";
import { Facebook, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface SuspendedCampaignsTableProps {
  campaigns: Campaign[];
}

export function SuspendedCampaignsTable({
  campaigns,
}: SuspendedCampaignsTableProps) {
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return (
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Facebook className="w-3 h-3 text-white" />
          </div>
        );
      case "instagram":
        return (
          <div className="w-6 h-6 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        );
      case "tiktok":
        return (
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-8 text-center">
        <p className="text-gray-500">No suspended campaigns</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full min-w-max">
          <thead className="bg-yellow-50 border-b border-yellow-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <Checkbox
                  checked={
                    selectedIds.size === campaigns.length &&
                    campaigns.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Campaign Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Platforms
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Started
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Impressions
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Reach
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                CTR (Click-Through Rate)
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                CPC (Cost per Click)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-khaki-200 rounded-lg">
            {campaigns.map((campaign) => {
              const isScheduledCampaign = campaign.status === "scheduled";
              const navigationUrl = isScheduledCampaign
                ? `/panel/campaigns/${campaign.id}/scheduled`
                : `/panel/campaigns/${campaign.id}`;

              return (
                <tr
                  key={campaign.id}
                  onClick={() => router.push(navigationUrl)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds.has(campaign.id)}
                      onCheckedChange={() => toggleSelect(campaign.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      {campaign.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {campaign.platforms.map((platform) => (
                        <div key={platform}>{getPlatformIcon(platform)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                      {campaign.started}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 whitespace-nowrap">
                      {campaign.impressions.toLocaleString()} views
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 whitespace-nowrap">
                      {campaign.reach.min.toLocaleString()} -{" "}
                      {campaign.reach.max.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-firebrick-500">
                        {campaign.ctr}%
                      </span>
                      <TrendingDown className="w-4 h-4 text-firebrick-500" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-firebrick-500 whitespace-nowrap">
                      ₦350.89
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
