"use client";

import { ShieldAlert } from "lucide-react";
import type { CampaignDto } from "@/lib/campaigns";

/**
 * Ads the platforms rejected or held, with each platform's own reason where
 * it was reported. Campaign-level status alone hides which creative to fix.
 */
export function RejectedAdsPanel({
  platformStatuses,
}: {
  platformStatuses?: CampaignDto["platformStatuses"];
}) {
  const flagged = (["meta", "tiktok"] as const).flatMap((platform) =>
    (platformStatuses?.[platform]?.ads ?? [])
      .filter((ad) => ad.status === "rejected")
      .map((ad) => ({ ...ad, platform })),
  );

  if (!flagged.length) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-red-600" aria-hidden />
        <h3 className="text-sm font-gilroy-semibold text-red-800">
          Ads that need attention
        </h3>
      </div>
      <ul className="space-y-2">
        {flagged.map((ad, index) => (
          <li
            key={`${ad.platform}-${ad.id ?? index}`}
            className="rounded-lg bg-white p-3 text-sm"
          >
            <span className="font-gilroy-semibold text-gray-900">
              {ad.name || ad.id || "Unnamed ad"}
            </span>
            <span className="mx-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-gilroy-bold uppercase text-red-700">
              {ad.platform} rejected
            </span>
            {ad.detail && (
              <p className="mt-1 text-xs text-dimGray">{ad.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
