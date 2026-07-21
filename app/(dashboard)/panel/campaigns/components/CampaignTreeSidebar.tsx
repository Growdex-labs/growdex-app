"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  Copy,
  MoreHorizontal,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { AudienceStrategy, CreateCampaignPayload } from "@/lib/campaigns";

interface CampaignTreeSidebarProps {
  campaignName?: string;
  campaign?: Pick<CreateCampaignPayload, "campaign" | "audienceStrategies">;
  activeStrategyId?: string | null;
  compact?: boolean;
  onSelectStrategy?: (id: string) => void;
  onAddStrategy?: () => void;
  onDuplicateStrategy?: (id: string) => void;
  onDeleteStrategy?: (id: string) => void;
  onSelectAd?: (strategyId: string, adIndex: number) => void;
}

const strategyNeedsAttention = (
  strategy: AudienceStrategy,
  platforms: CreateCampaignPayload["campaign"]["platforms"],
) =>
  !strategy.name.trim() ||
  !strategy.audience.locations.length ||
  strategy.budget.amount <= 0 ||
  platforms.some(
    (platform) => !strategy.ads.some((ad) => ad.platform === platform),
  );

export function CampaignTreeSidebar({
  campaignName = "Untitled Campaign",
  campaign,
  activeStrategyId,
  compact = false,
  onSelectStrategy,
  onAddStrategy,
  onDuplicateStrategy,
  onDeleteStrategy,
  onSelectAd,
}: CampaignTreeSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const strategies = campaign?.audienceStrategies ?? [];
  const truncatedName =
    campaignName.length > 18 ? `${campaignName.slice(0, 18)}..` : campaignName;

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white lg:flex ${
        compact ? "w-52 p-3 xl:w-60 xl:p-4" : "w-[20.25rem] p-4"
      }`}
    >
      <Link
        href="/panel/campaigns"
        className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
      >
        <ChevronLeft className="size-4" /> Back
      </Link>

      <div className="mt-6 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-semibold text-gray-900 truncate">
        {truncatedName}
      </div>

      <div className="mt-3 space-y-2">
        {strategies.map((strategy, strategyIndex) => {
          const isOpen = expanded[strategy.id] ?? true;
          const isActive = strategy.id === (activeStrategyId ?? strategies[0]?.id);
          const visibleAds = campaign?.campaign.configuration.sameCreativeForAll
            ? strategy.ads.slice(0, 1)
            : strategy.ads;
          return (
            <div key={strategy.id}>
              <div
                className={`relative flex items-center gap-2 rounded-lg border px-3 py-2.5 transition ${
                  isActive
                    ? "border-khaki-300 bg-gray-900 text-khaki-200"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((current) => ({
                      ...current,
                      [strategy.id]: !isOpen,
                    }))
                  }
                  aria-label={isOpen ? "Collapse audience strategy" : "Expand audience strategy"}
                >
                  <ChevronDown className={`size-4 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectStrategy?.(strategy.id)}
                  className="min-w-0 flex-1 truncate text-left text-sm font-semibold"
                >
                  {strategy.name || `Audience Strategy ${strategyIndex + 1}`}
                </button>
                {campaign && strategyNeedsAttention(strategy, campaign.campaign.platforms) && (
                  <TriangleAlert className="size-4 shrink-0 text-khaki-300" />
                )}
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === strategy.id ? null : strategy.id)}
                  aria-label={`Actions for ${strategy.name}`}
                >
                  <MoreHorizontal className="size-4" />
                </button>
                {openMenu === strategy.id && (
                  <div className="absolute right-2 top-10 z-20 w-40 rounded-xl border border-gray-200 bg-white p-1 text-gray-700 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        onDuplicateStrategy?.(strategy.id);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <Copy className="size-4" /> Duplicate
                    </button>
                    <button
                      type="button"
                      disabled={strategies.length === 1}
                      onClick={() => {
                        onDeleteStrategy?.(strategy.id);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="size-4" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="relative ml-3 mt-2 space-y-2 pl-4">
                  <span className="absolute bottom-4 left-0 -top-2 w-px bg-gray-200" />
                  {visibleAds.map((ad, adIndex) => (
                    <button
                      key={`${strategy.id}-${ad.platform}-${adIndex}`}
                      type="button"
                      onClick={() => onSelectAd?.(strategy.id, adIndex)}
                      className="relative flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 hover:border-khaki-300"
                    >
                      <span className="absolute -left-4 top-1/2 h-px w-4 bg-gray-200" />
                      <span className="min-w-0 flex-1 truncate">
                        {ad.headline?.trim() || `Ad ${adIndex + 1}`}
                      </span>
                      {!ad.mediaUrl && <TriangleAlert className="size-4 text-khaki-300" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onAddStrategy && (
        <button
          type="button"
          onClick={onAddStrategy}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-khaki-300 hover:bg-khaki-50"
        >
          <Plus className="size-4" /> Add Audience Strategy
        </button>
      )}
    </aside>
  );
}

export default CampaignTreeSidebar;
