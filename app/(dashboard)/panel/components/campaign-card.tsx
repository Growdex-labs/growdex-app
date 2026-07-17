"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { CampaignDto } from "@/lib/campaigns";

interface CampaignCardProps {
  campaign: CampaignDto;
  href: string;
}

const statusLabel = (status?: string) => {
  const value = (status ?? "draft").replaceAll("_", " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const statusClass = (status?: string) => {
  switch ((status ?? "draft").toLowerCase()) {
    case "active":
      return "border-green-200 bg-green-50 text-green-700";
    case "failed":
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    case "paused":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-violet-200 bg-violet-50 text-violet-700";
  }
};

const formatMoney = (campaign: CampaignDto) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: campaign.budget.currency,
    maximumFractionDigits: 2,
  }).format(campaign.budget.amount);

export function CampaignCard({ campaign, href }: CampaignCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="truncate text-lg font-bold text-gray-900">
          {campaign.name}
        </h2>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClass(campaign.status)}`}
        >
          {statusLabel(campaign.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {campaign.platforms.map((platform) => (
          <span
            key={platform}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600"
          >
            {platform}
          </span>
        ))}
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
          {campaign.goal.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">
          {campaign.budget.type === "daily" ? "Daily budget" : "Lifetime budget"}
        </p>
        <p className="mt-1 font-semibold text-gray-900">
          {formatMoney(campaign)}
        </p>
      </div>

      {campaign.publishError && (
        <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{campaign.publishError}</p>
        </div>
      )}
    </Link>
  );
}

export default CampaignCard;
