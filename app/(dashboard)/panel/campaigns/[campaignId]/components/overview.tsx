"use client";

import React from "react";
import { Campaign } from "@/lib/mock-data";
import { PerformanceChart } from "./performance-chart";
import {
  Facebook,
  Instagram,
  MoreVertical,
  TrendingDownIcon,
  Users,
} from "lucide-react";
import { MetricCard } from "../../../components/metric-card";

interface OverviewProps {
  campaign: Campaign;
  subTab: string;
}

// Mock chart data
const chartData = [
  { date: "21/09/2025", facebook: 6000, instagram: 8000, tiktok: 10000 },
  { date: "21/09/2025", facebook: 6500, instagram: 9500, tiktok: 6500 },
  { date: "21/09/2025", facebook: 7500, instagram: 10000, tiktok: 7500 },
  { date: "21/09/2025", facebook: 8000, instagram: 10500, tiktok: 11000 },
  { date: "21/09/2025", facebook: 12500, instagram: 14500, tiktok: 7500 },
];

export function Overview({ campaign, subTab }: OverviewProps) {
  return (
    <div className="space-y-6">
      <PerformanceChart
        data={chartData}
        totalSpent="N56,980.98"
        changePercentage={-35.7}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Impressions Card */}
        <div className="bg-gray-100 p-4 md:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-xs font-medium">Impressions</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              53,567 Impressions
            </h2>
            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
              35.7%
              <TrendingDownIcon className="w-3 h-3" />
            </span>
          </div>

          {/* Platform Stats */}
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2">
              <div className="w-4 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Facebook className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                23,900
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                23,900
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                16,000
              </span>
            </div>
          </div>
        </div>

        {/* Total Reach Card */}
        <div className="bg-gray-100 p-4 md:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-xs font-medium">Total reach</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              73,000 reached
            </h2>
            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
              35.7%
              <TrendingDownIcon className="w-3 h-3" />
            </span>
          </div>

          {/* Platform Stats */}
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Facebook className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                23,900
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                23,900
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                16,000
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Cost per Conversion/CPA */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">
              Cost per Conversion/CPA
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-3 md:mb-4">
            <span className="text-2xl md:text-4xl font-bold text-gray-900">
              N1,300.80
            </span>
            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
              35.7%
              <TrendingDownIcon className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-[#B8A247]">
            <span className="text-base md:text-lg">✨</span>
            <span>Optimize for campaign goal</span>
          </div>
        </div>

        {/* Cost Per Click (CPC) */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">
              Cost Per Click (CPC)
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-3 md:mb-4">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">
              N350.89
            </span>
            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
              35.7%
              <TrendingDownIcon className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-[#B8A247]">
            <span className="text-base md:text-lg">✨</span>
            <span>Optimize for campaign goal</span>
          </div>
        </div>

        {/* Audience Reception */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">
              Audience Reception
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-7 h-7 md:w-9 md:h-9 text-red-600" />
              <span className="text-2xl md:text-3xl font-bold text-red-600">
                Negative
              </span>
            </div>
            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
              35.7%
              <TrendingDownIcon className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-[#B8A247]">
            <span className="text-base md:text-lg">✨</span>
            <span>Optimize for campaign goal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
