"use client";

import { Campaign } from "@/lib/mock-data";
import { BarChartIcon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 bg-white p-6 rounded-xl">
      <div className="flex items-stretch gap-6">
        <div className="space-y-4 flex-1">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-2">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => router.push("/panel/campaigns")}
            >
              All campaigns
            </span>
            <span className="mx-2">&gt;&gt;</span>
            <span className="text-gray-900">{campaign.name}</span>
          </div>

          {/* Campaign Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {campaign.name}
          </h1>
          <div className="flex items-center gap-4">
            {/* Budget Burn Badge */}
            <button className="px-6 py-2 flex-1 bg-bisque-50 text-firebrick-500 rounded-xl font-medium flex items-center gap-2 hover:bg-bisque-100 transition-colors text-sm font-gilroy-bold">
              <img src="/mdi_fire.png" alt="fire-alt" />
              Budget Burn
            </button>

            {/* Platform Icons Container */}
            <div className="bg-gray-100 flex-1 rounded-xl px-6 py-2 flex justify-center items-center gap-3">
              {campaign.platforms.map((platform) => (
                <div key={platform}>
                  {platform === "facebook" && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                  )}
                  {platform === "tiktok" && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </div>
                  )}
                  {platform === "instagram" && (
                    <div className="w-6 h-6 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-300 self-stretch"></div>

        {/* Column 2: Description */}
        <div className="px-6 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="w-4 h-4 text-khaki-200" />
            <span className="text-sm font-medium text-gray-400">
              Description
            </span>
          </div>
          <p className="text-gray-700 font-bold text-sm leading-relaxed">
            {campaign.description || "No description provided."}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-300 self-stretch"></div>

        {/* Column 3: Campaign Goal */}
        <div className="bg-slate-300/20 border border-gray-200 rounded-xl p-6 flex-1">
          <p className="text-sm text-gray-500 mb-2">Campaign goal</p>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {campaign.goal || "No goal specified"}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-500 font-medium">
                {campaign.optimizationPercentage}% optimized
              </span>
            </div>
          </div>

          <button className="text-sm text-khaki-300 flex items-center gap-2 hover:text-khaki-400 transition-colors">
            <SparklesIcon className="w-4 h-4" />
            Optimize for campaign goal
          </button>
        </div>
      </div>
    </div>
  );
}
