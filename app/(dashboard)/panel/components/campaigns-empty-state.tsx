"use client";

import { Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";

interface CampaignsEmptyStateProps {
  onCreateClick?: () => void;
}

export function CampaignsEmptyState({
  onCreateClick,
}: CampaignsEmptyStateProps) {
  return (
    <div className="w-full">
      {/* Table Header */}
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
        </table>
      </div>

      {/* Empty State Content */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Megaphone className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            You don't have any campaigns running.
          </h3>
          <p className="text-gray-500 text-sm">
            Create your first campaign to get started
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/panel/campaigns/new"
          onClick={onCreateClick}
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
    </div>
  );
}
