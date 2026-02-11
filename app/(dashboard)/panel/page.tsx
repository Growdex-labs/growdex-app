"use client";

import { useEffect, useState } from "react";
import { PanelLayout } from "./components/panel-layout";
import { DashboardHeader } from "./components/dashboard-header";
import { PerformanceChart } from "./components/performance-chart";
import { CTRLineChart } from "./components/ctr-line-chart";
import { DonutChart } from "./components/donut-chart";
import { Users, TrendingDown } from "lucide-react";
import { fetchPanelMetrics } from "@/lib/panel";

type DashboardMetrics = {
  totalSpent: number;
  totalImpressions: number;
  costPerConversion: { value: number; trend: number };
  costPerClick: { value: number; trend: number };
  clickThroughRate: { meta: number; tiktok: number; trend: number };
  audienceReception: { value: string; trend: number };
};

const ZERO_METRICS: DashboardMetrics = {
  totalSpent: 0,
  totalImpressions: 0,
  costPerConversion: { value: 0, trend: 0 },
  costPerClick: { value: 0, trend: 0 },
  clickThroughRate: { meta: 0, tiktok: 0, trend: 0 },
  audienceReception: { value: "0", trend: 0 },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatNumber = (value: number) =>
  Math.trunc(Number.isFinite(value) ? value : 0).toLocaleString("en-US");

export default function PanelPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(ZERO_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      try {
        console.log("Loading dashboard metrics...");
        const result = await fetchPanelMetrics();

        if (result) {
          console.log("Dashboard metrics loaded:", result);
          setMetrics({
            totalSpent:
              typeof result.totalSpend === "number" ? result.totalSpend : 0,
            totalImpressions:
              typeof result.totalImpressions === "number"
                ? result.totalImpressions
                : 0,
            costPerConversion: {
              value: typeof result.cpa === "number" ? result.cpa : 0,
              trend: 0,
            },
            costPerClick: {
              value: typeof result.cpc === "number" ? result.cpc : 0,
              trend: 0,
            },
            clickThroughRate: {
              meta:
                typeof result.byPlatform?.meta?.ctr === "number"
                  ? result.byPlatform.meta.ctr
                  : 0,
              tiktok:
                typeof result.byPlatform?.tiktok?.ctr === "number"
                  ? result.byPlatform.tiktok.ctr
                  : 0,
              trend: 0,
            },
            audienceReception: {
              value:
                typeof result.audienceReception === "string"
                  ? result.audienceReception
                  : "0",
              trend: 0,
            },
          });
        } else {
          console.log("No data returned, keeping zeros");
          setMetrics(ZERO_METRICS);
        }
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
        setMetrics(ZERO_METRICS);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardMetrics();
  }, []);

  return (
    <PanelLayout>
      <div className="p-8 font-gilroy-bold">
        <DashboardHeader />

        {/* Chart and Side Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Spending Chart - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <PerformanceChart
              data={[]}
              totalSpent={formatCurrency(metrics.totalSpent)}
              changePercentage={metrics.costPerConversion.trend}
            />
          </div>

          {/* Side Metrics Panel */}
          <div className="space-y-4">
            {/* Cost Per Conversion */}
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">
                Cost per Conversion: CPA
              </div>
              <div className="flex gap-4">
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {formatCurrency(metrics.costPerConversion?.value ?? 0)}
                </div>
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <TrendingDown className="w-5 h-5" />{" "}
                  {Math.abs(metrics.costPerConversion?.trend ?? 0)}%
                </div>
              </div>
            </div>

            {/* Cost Per Click */}
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">
                Cost Per Click: (CPC)
              </div>
              <div className="flex gap-4">
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {formatCurrency(metrics.costPerClick?.value ?? 0)}
                </div>
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <TrendingDown className="w-5 h-5" />{" "}
                  {Math.abs(metrics.costPerClick?.trend ?? 0)}%
                </div>
              </div>
            </div>

            {/* Audience Reception */}
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">
                Audience Reception
              </div>
              <div className="flex gap-4">
                <div className="text-3xl font-bold text-red-500 mb-2 flex items-center gap-2">
                  <Users className="w-8 h-8" />
                  {metrics.audienceReception?.value ?? "-"}
                </div>
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <TrendingDown className="w-5 h-5" />{" "}
                  {Math.abs(metrics.audienceReception?.trend ?? 0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Click-Through Rate */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm text-gray-600">Click-Through Rate</div>
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

            <div className="flex items-center gap-8 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <img
                    src="/logos_meta-icon.png"
                    className="w-2.5 h-2.5 md:w-3 md:h-3 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="text-2xl font-semibold text-blue-500">
                    {metrics.clickThroughRate.meta}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    {Math.abs(metrics.clickThroughRate.trend)}%{" "}
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
                <div className="flex gap-2">
                  <div className="text-2xl font-semibold text-gray-900">
                    {metrics.clickThroughRate.tiktok}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    {Math.abs(metrics.clickThroughRate.trend)}%{" "}
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <CTRLineChart />
          </div>

          {/* Total Impressions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm text-gray-600">Total Impressions</div>
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

            <div className="text-4xl font-bold text-gray-900 mb-6">
              {formatNumber(metrics.totalImpressions)}
            </div>

            {/* Donut Chart */}
            <DonutChart meta={0} tiktok={0} />
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
