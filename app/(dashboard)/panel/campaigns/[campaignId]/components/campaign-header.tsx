"use client";

import { Campaign } from "@/lib/mock-data";
import {
  AlertCircle,
  BarChartIcon,
  Facebook,
  Instagram,
  SparklesIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CampaignHeaderProps {
  campaign: Campaign;
  onOptimizationClick?: () => void;
}

export function CampaignHeader({
  campaign,
  onOptimizationClick,
}: CampaignHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 bg-white p-4 rounded-xl">
      <div className="flex items-stretch gap-6">
        <div className="space-y-2 flex-1 mt-6">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-500">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => router.push("/panel/campaigns")}
            >
              All campaigns
            </span>
            <span className="mx-1 text-xs">&gt;&gt;</span>
            <span className="text-gray-900">{campaign.name}</span>
          </div>

          {/* Campaign Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {campaign.name}
          </h1>
          <div className="flex items-center gap-2 w-full">
            {/* Budget Burn Badge */}
            <button className="px-4 py-2   bg-bisque-50 text-firebrick-500 rounded-lg font-medium flex items-center gap-2 hover:bg-bisque-100 transition-colors text-xs font-gilroy-bold">
              <img src="/mdi_fire.png" alt="fire-alt" className="size-4" />
              Budget Burn
            </button>

            {/* Platform Icons Container */}
            <div className="bg-gray-100 rounded-xl py-2 flex justify-center items-center gap-3 transition-all px-4">
              {campaign.platforms.map((platform) => (
                <div key={platform}>
                  {platform === "facebook" && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center transition-all">
                      <Facebook className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {platform === "tiktok" && (
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center transition-all">
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </div>
                  )}
                  {platform === "instagram" && (
                    <div className="w-5 h-5 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center transition-all">
                      <Instagram className="w-3 h-3 text-white" />
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6">
            <SparklesIcon className="w-3 h-3 text-khaki-200" />
            <span className="text-xs font-medium text-gray-400 ">
              Description
            </span>
          </div>
          <p className="text-gray-700 font-semibold text-sm leading-relaxed">
            {campaign.description || "No description provided."}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-300 self-stretch"></div>

        {/* Column 3: Campaign Goal */}
        <div className="bg-slate-300/20 border border-gray-200 rounded-xl p-6 flex-1">
          <p className="text-sm text-gray-500 mb-2">Campaign goal</p>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {campaign.goal || "No goal specified"}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-500 font-semibold">
                {campaign.optimizationPercentage}% optimized
              </span>
            </div>
          </div>

          <button
            onClick={onOptimizationClick}
            className="text-xs text-khaki-300 flex items-center gap-2 hover:text-khaki-400 font-semibold transition-colors cursor-pointer"
          >
            <SparklesIcon className="w-3 h-3" />
            Optimize for campaign goal
          </button>
        </div>
      </div>
    </div>
  );
}
