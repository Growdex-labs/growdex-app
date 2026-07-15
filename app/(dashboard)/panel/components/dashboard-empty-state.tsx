"use client";

import Link from "next/link";
import { LayoutDashboard, Plus } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <div className="bg-[#f9faff] rounded-lg flex-1 flex flex-col items-center justify-center gap-6 py-24 px-4">
      <LayoutDashboard className="w-28 h-28 text-[#e7e9ee]" strokeWidth={1.5} />

      <div className="text-center">
        <p className="text-xl text-[#9095a7] font-gilroy-bold leading-6">
          No data to report.
        </p>
        <p className="text-sm text-[#9095a7] font-gilroy-regular leading-6">
          You can create a campaign and start tracking data
        </p>
      </div>

      <Link
        href="/panel/campaigns/new"
        className="bg-khaki-200 flex items-center gap-3 px-6 py-2 rounded-lg text-gray-800 text-sm font-gilroy-regular hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Create campaign
      </Link>
    </div>
  );
}
