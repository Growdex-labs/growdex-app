"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { isOnboardingComplete, fetchOnboardingStatus } from "@/lib/onboarding";
import { PanelLayout } from "./components/panel-layout";
import { DashboardHeader } from "./components/dashboard-header";
import { MetricCard, ProgressBar } from "./components/metric-card";
import { SpendingChart } from "./components/spending-chart";
import { CTRLineChart } from "./components/ctr-line-chart";
import { DonutChart } from "./components/donut-chart";
import {
  mockDashboardMetrics,
  mockChartData,
  formatCurrency,
  formatNumber,
} from "@/lib/mock-data";
import {
  Megaphone,
  TrendingUp,
  Flame,
  Users,
  TrendingDown,
} from "lucide-react";

export default function PanelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  //   useEffect(() => {
  //     const checkAccess = async () => {
  //       // First check authentication
  //       if (!isAuthenticated()) {
  //         router.push('/login');
  //         return;
  //       }

  //       // Check onboarding status from local storage first for quick check
  //       if (!isOnboardingComplete()) {
  //         // Verify with backend
  //         const result = await fetchOnboardingStatus();

  //         if (!result.completed) {
  //           router.push('/onboarding');
  //           return;
  //         }
  //       }

  //       setIsLoading(false);
  //     };

  //     checkAccess();
  //   }, [router]);

  //   if (isLoading) {
  //    return (
  //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
  //           <div className="text-gray-600">Loading dashboard...</div>
  //         </div>
  //       </div>
  //     );
  //   }

  const metrics = mockDashboardMetrics;
  const totalCampaigns =
    metrics.campaigns.active +
    metrics.campaigns.paused +
    metrics.campaigns.suspended +
    metrics.campaigns.drafts;

  return (
    <PanelLayout>
      <div className="p-4 md:p-6 lg:p-8 font-gilroy-bold">
        <DashboardHeader />

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Campaigns Summary Card */}
          <MetricCard
            title="Campaigns"
            icon={<Megaphone className="w-5 h-5" />}
            value={totalCampaigns}
            variant="yellow"
          >
            <div className="space-y-1 mt-2">
              <ProgressBar
                label="Active"
                value={metrics.campaigns.active}
                total={totalCampaigns}
                color="green"
              />
              <ProgressBar
                label="Paused"
                value={metrics.campaigns.paused}
                total={totalCampaigns}
                color="yellow"
              />
              <ProgressBar
                label="Suspended"
                value={metrics.campaigns.suspended}
                total={totalCampaigns}
                color="red"
              />
              <ProgressBar
                label="Drafts"
                value={metrics.campaigns.drafts}
                total={totalCampaigns}
                color="gray"
              />
            </div>
          </MetricCard>

          {/* Top Performing Campaign */}
          <MetricCard
            title="Top Performing Campaign"
            icon={<img src="/hugeicons_star-award-01.png" alt="star-award" />}
            variant="yellow"
          >
            <div className="text-xl font-bold text-gray-900 mb-1">
              {metrics.topPerformer.name}
            </div>
            <div className="h-full flex flex-col justify-between">
              <div className="text-sm text-gray-300 mb-2">
                All campaigns &gt;&gt;{" "}
                <span className="text-gray-400">Campaign Test</span>
              </div>
              <div className="mt-3 flex justify-between items-end">
                <div className="text-sm text-gray-600 mb-1">
                  Cost per Conversion: CPA
                </div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  {metrics.topPerformer.cpaTrend}%{" "}
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
          </MetricCard>

          {/* Campaign Performance */}
          <MetricCard title="Campaign Performance" variant="yellow">
            <div className="flex items-center justify-baseline py-8">
              <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-500 transition-colors text-sm md:text-base">
                <Flame className="w-5 h-5" />
                Budget Burn
              </button>
            </div>
          </MetricCard>
        </div>

        {/* Chart and Side Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Spending Chart - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <SpendingChart data={mockChartData} />
          </div>

          {/* Side Metrics Panel */}
          <div className="space-y-4">
            {/* Cost Per Conversion */}
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 md:p-6">
              <div className="text-xs md:text-sm text-gray-600 mb-2">
                Cost per Conversion: CPA
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-2xl md:text-3xl font-bold text-red-500">
                  {formatCurrency(metrics.costPerConversion.value)}
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm text-red-600">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />{" "}
                  {Math.abs(metrics.costPerConversion.trend)}%
                </div>
              </div>
            </div>

            {/* Cost Per Click */}
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 md:p-6">
              <div className="text-xs md:text-sm text-gray-600 mb-2">
                Cost Per Click: (CPC)
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-2xl md:text-3xl font-bold text-red-500">
                  {formatCurrency(metrics.costPerClick.value)}
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm text-red-600">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />{" "}
                  {Math.abs(metrics.costPerClick.trend)}%
                </div>
              </div>
            </div>

            {/* Audience Reception */}
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 md:p-6">
              <div className="text-xs md:text-sm text-gray-600 mb-2">
                Audience Reception
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-2xl md:text-3xl font-bold text-red-500 flex items-center gap-2">
                  <Users className="w-6 h-6 md:w-8 md:h-8" />
                  {metrics.audienceReception.value}
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm text-red-600">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />{" "}
                  {Math.abs(metrics.audienceReception.trend)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Click-Through Rate */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs md:text-sm text-gray-600">
                Click-Through Rate
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 mb-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-xl md:text-2xl font-semibold text-blue-500">
                    {metrics.clickThroughRate.facebook}%
                  </div>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-red-600 whitespace-nowrap">
                    {Math.abs(metrics.clickThroughRate.trend)}%{" "}
                    <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-8 h-8 bg-black rounded-full flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-xl md:text-2xl font-semibold text-gray-900">
                    {metrics.clickThroughRate.tiktok}%
                  </div>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-red-600 whitespace-nowrap">
                    {Math.abs(metrics.clickThroughRate.trend)}%{" "}
                    <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <CTRLineChart />
          </div>

          {/* Total Impressions */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs md:text-sm text-gray-600">
                Total Impressions
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {formatNumber(metrics.totalImpressions)}
            </div>

            {/* Donut Chart */}
            <DonutChart
              facebook={6789560}
              instagram={14300000}
              tiktok={16500000}
            />
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
