"use client";

import { Sparkles } from "lucide-react";

interface CampaignNameCardProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  generating?: boolean;
  rationale?: string | null;
}

export function CampaignNameCard({
  value,
  onChange,
  onGenerate,
  generating = false,
  rationale,
}: CampaignNameCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <label
        htmlFor="setupCampaignName"
        className={
          value.trim()
            ? "sr-only"
            : "block text-sm text-gray-400 mb-1"
        }
      >
        Enter your campaign name
      </label>
      <input
        id="setupCampaignName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={100}
        placeholder="Untitled Campaign"
        className="block w-full text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />
      {onGenerate && (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {generating ? "Generating campaign name…" : "Generate campaign name"}
        </button>
      )}
      {rationale && (
        <p className="mt-2 text-xs leading-5 text-violet-600">{rationale}</p>
      )}
    </div>
  );
}

export default CampaignNameCard;
