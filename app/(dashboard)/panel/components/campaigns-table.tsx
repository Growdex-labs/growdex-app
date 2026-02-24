"use client";

import { Campaign } from "@/lib/mock-data";
import {
  Facebook,
  Instagram,
  MoreVertical,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { CampaignsEmptyState } from "./campaigns-empty-state";

interface CampaignsTableProps {
  campaigns: Campaign[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const router = useRouter();

  // Show empty state if no campaigns
  if (campaigns.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <CampaignsEmptyState />
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "meta":
        return (
          <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
            <img
              src="/logos_meta-icon.png"
              alt="meta"
              className="w-3 h-3 text-white"
            />
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-yellow-50 border-b border-yellow-100">
            <tr>
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
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1">
                  CTR (Click-Through Rate)
                  <div className="flex gap-1">
                    <button className="text-red-600 hover:text-red-700">
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
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <button className="text-green-600 hover:text-green-700">
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                CPC (Cost per Click)
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Cost per Conversion / CPA
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Delivery Health
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                Growth Recommendations
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-khaki-300" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
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
                      <span className="text-lg font-bold text-gray-900">
                        {campaign.ctr}%
                      </span>
                      <span
                        className={`text-sm flex items-center gap-1 ${
                          campaign.ctrTrend >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {campaign.ctrTrend >= 0 ? "↑" : "↓"}{" "}
                        {Math.abs(campaign.ctrTrend)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-firebrick-500">
                        ₦350.89
                      </span>
                      <TrendingDown className="w-4 h-4 text-firebrick-500" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-firebrick-500">
                          ₦1,300.80
                        </span>
                        <TrendingDown className="w-4 h-4 text-firebrick-500" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-peru-200 cursor-pointer">
                        <Sparkles className="w-3 h-3" />
                        optimize with AI
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 bg-bisque-50 text-firebrick-500 rounded-xl font-medium flex items-center gap-2 hover:bg-bisque-100 transition-colors text-sm whitespace-nowrap">
                      <img src="/mdi_fire.png" alt="fire" className="w-4 h-4" />
                      Budget Burn
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                      Growth Recommendations
                    </div>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          aria-label="Open menu"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem>Pause</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
