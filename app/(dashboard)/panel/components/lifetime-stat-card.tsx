"use client";

import { MoreVertical, Sparkles } from "lucide-react";
import { MetaIcon, PlatformMark } from "./platform-icons";
import { TrendBadge, type TrendGoodDirection } from "./trend-badge";
import type { PanelPlatform } from "@/lib/panel";

/** A platform figure the card cannot show reads as an em dash, never as zero. */
export type PlatformBreakdown = Partial<Record<PanelPlatform, string | null>>;

const PLATFORM_ORDER: PanelPlatform[] = ["meta", "tiktok"];

interface LifetimeStatCardProps {
  label: string;
  value: string;
  trend: number;
  goodDirection?: TrendGoodDirection;
  breakdown?: PlatformBreakdown;
  showAssistantHint?: boolean;
}

export function LifetimeStatCard({
  label,
  value,
  trend,
  goodDirection,
  breakdown,
  showAssistantHint = false,
}: LifetimeStatCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-lavender-100 bg-lavender-25 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-inter text-sm font-bold tracking-[-0.14px] text-[#333]">
            {label}
          </span>
          <button
            type="button"
            className="text-lavender-200 transition-colors hover:text-[#333]"
            aria-label={`${label} options`}
          >
            <MoreVertical className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-lexend text-2xl text-[#333]">{value}</p>
          <div className="h-6">
            <TrendBadge trend={trend} goodDirection={goodDirection} />
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {PLATFORM_ORDER.map((platform) => (
            <span key={platform} className="flex items-center gap-1">
              {platform === "meta" ? (
                <MetaIcon className="size-4" />
              ) : (
                <PlatformMark platform="tiktok" />
              )}
              <span className="font-gilroy-medium text-[15px] text-lavender-300">
                {breakdown?.[platform] ?? "—"}
              </span>
            </span>
          ))}
        </div>
        {showAssistantHint && (
          <Sparkles className="size-4 shrink-0 text-khaki-300" aria-hidden />
        )}
      </div>
    </div>
  );
}
