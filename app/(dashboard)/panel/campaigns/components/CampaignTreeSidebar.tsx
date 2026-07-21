"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, TriangleAlert } from "lucide-react";
import type { CreateCampaignPayload } from "@/lib/campaigns";

interface Ad {
  id: string;
  name: string;
  warning?: boolean;
}

interface AdSet {
  id: string;
  name: string;
  warning?: boolean;
  ads: Ad[];
}

interface CampaignTreeSidebarProps {
  campaignName?: string;
  adSets?: AdSet[];
  campaign?: Pick<CreateCampaignPayload, "campaign" | "adContent">;
  compact?: boolean;
}

export function CampaignTreeSidebar({
  campaignName = "Untitled Campaign",
  adSets = [],
  campaign,
  compact = false,
}: CampaignTreeSidebarProps) {
  const visibleAdSets = useMemo<AdSet[]>(
    () =>
      campaign
        ? campaign.campaign.platforms.map((platform) => {
            const label = platform === "meta" ? "Meta" : "TikTok";
            const creatives = campaign.adContent.creatives.filter(
              (creative) => creative.platform === platform,
            );

            return {
              id: platform,
              name: `${campaign.campaign.configuration.adSetName || "Primary ad set"} · ${label}`,
              warning:
                !campaign.campaign.configuration.accountAssetIds?.[platform],
              ads: creatives.map((creative, index) => ({
                id: `${platform}-${index}`,
                name:
                  creative.headline?.trim() || `${label} creative ${index + 1}`,
                warning: !creative.mediaUrl,
              })),
            };
          })
        : adSets,
    [adSets, campaign],
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const truncatedName =
    campaignName.length > 18 ? `${campaignName.slice(0, 18)}..` : campaignName;

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white lg:flex ${
        compact ? "w-44 p-3 xl:w-52 xl:p-4" : "w-[27rem] p-4"
      }`}
    >
      {/* Back */}
      <Link
        href="/panel/campaigns"
        className={`flex items-center gap-2 rounded-lg bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100 ${
          compact
            ? "px-3 py-2.5 text-sm font-medium"
            : "px-4 py-2.5 text-sm font-medium"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Campaign name */}
      <div
        className={`rounded-lg bg-khaki-200 font-semibold text-gray-900 truncate ${
          compact ? "mt-4 px-3 py-2.5 text-sm" : "mt-6 px-4 py-2.5 text-sm"
        }`}
      >
        {truncatedName}
      </div>

      {/* Ad sets tree */}
      <div className="mt-3 space-y-2">
        {visibleAdSets.map((adSet) => {
          const isOpen = expanded[adSet.id] ?? true;
          return (
            <div key={adSet.id}>
              {/* Ad set row */}
              <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2.5 text-khaki-200">
                <button
                  type="button"
                  onClick={() => toggle(adSet.id)}
                  className="shrink-0"
                  aria-label={isOpen ? "Collapse ad set" : "Expand ad set"}
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>
                <div className="flex flex-1 items-center gap-1.5">
                  <span
                    className={
                      compact
                        ? "text-xs font-semibold xl:text-sm"
                        : "text-sm font-semibold"
                    }
                  >
                    {adSet.name}
                  </span>
                  {adSet.warning && (
                    <TriangleAlert className="w-4 h-4 text-khaki-200" />
                  )}
                </div>
              </div>

              {/* Ads */}
              {isOpen && (
                <div className="relative ml-3 mt-2 space-y-2 pl-4">
                  {/* vertical tree line */}
                  <span className="absolute left-0 -top-2 bottom-4 w-px bg-gray-200" />
                  {adSet.ads.map((ad) => (
                    <div key={ad.id} className="relative">
                      {/* horizontal connector */}
                      <span className="absolute -left-4 top-1/2 w-4 h-px bg-gray-200" />
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                        <div className="flex flex-1 items-center gap-1.5">
                          <span
                            className={
                              compact
                                ? "text-xs text-gray-700 xl:text-sm"
                                : "text-sm text-gray-700"
                            }
                          >
                            {ad.name}
                          </span>
                          {ad.warning && (
                            <TriangleAlert className="w-4 h-4 text-khaki-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default CampaignTreeSidebar;
