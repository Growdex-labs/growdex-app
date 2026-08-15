"use client";

import { Sparkles } from "lucide-react";
import { PURPLE_GRADIENT } from "../campaigns/components/ai-campaign-theme";

interface CampaignsAiFabProps {
  onClick: () => void;
  recommendationCount: number;
}

export function CampaignsAiFab({
  onClick,
  recommendationCount,
}: CampaignsAiFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        recommendationCount > 0
          ? `Open campaign assistant, ${recommendationCount} recommendations waiting`
          : "Open campaign assistant"
      }
      className="fixed right-5 bottom-24 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 md:right-8 md:bottom-8"
      style={{ background: PURPLE_GRADIENT }}
    >
      <Sparkles className="size-6" aria-hidden />
      {recommendationCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-red-600 font-inter text-[10px] font-semibold text-white">
          {recommendationCount > 9 ? "9+" : recommendationCount}
        </span>
      )}
    </button>
  );
}
