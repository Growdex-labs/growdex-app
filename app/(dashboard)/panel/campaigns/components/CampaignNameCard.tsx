"use client";

import { Sparkles } from "lucide-react";

interface CampaignNameCardProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  generating?: boolean;
  rationale?: string | null;
  disabledReason?: string | null;
  prominent?: boolean;
}

export function CampaignNameCard({
  value,
  onChange,
  onGenerate,
  generating = false,
  rationale,
  disabledReason,
  prominent = false,
}: CampaignNameCardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${
        prominent ? "p-6 md:p-7" : "p-5"
      }`}
    >
      <label
        htmlFor="setupCampaignName"
        className={
          value.trim()
            ? "sr-only"
            : `mb-1 block text-gray-400 ${prominent ? "text-base" : "text-sm"}`
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
        className={`block w-full font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none ${
          prominent ? "text-2xl" : "text-lg"
        }`}
      />
      {onGenerate && (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || Boolean(disabledReason)}
          className={`mt-2 inline-flex items-center gap-1 font-medium text-violet-500 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50 ${
            prominent ? "text-sm" : "text-xs"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {generating ? "Generating campaign name…" : "Generate campaign name"}
        </button>
      )}
      {rationale && (
        <p className="mt-2 text-xs leading-5 text-violet-600">{rationale}</p>
      )}
      {disabledReason && onGenerate && (
        <p className="mt-2 text-xs leading-5 text-amber-700">
          {disabledReason}
        </p>
      )}
    </div>
  );
}

export default CampaignNameCard;
