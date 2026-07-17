"use client";

import { useState } from "react";
import { SendHorizontal, ChevronDown } from "lucide-react";
import { PURPLE_GRADIENT } from "../campaigns/components/AiCampaignChat";

interface DashboardAiBarProps {
  campaigns: string[];
  onSend: (text: string) => void;
  onSelectCampaign: (name: string) => void;
}

export function DashboardAiBar({
  campaigns,
  onSend,
  onSelectCampaign,
}: DashboardAiBarProps) {
  const [prompt, setPrompt] = useState("");

  const submit = () => {
    const value = prompt.trim();
    if (!value) return;
    onSend(value);
    setPrompt("");
  };

  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-center gap-2 px-4">
      {/* Select a campaign */}
      <div className="relative">
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) onSelectCampaign(e.target.value);
          }}
          className="appearance-none rounded-lg bg-gray-100 pl-4 pr-8 py-3.5 text-sm text-gray-600 focus:outline-none"
        >
          <option value="">Select a campaign</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Prompt input */}
      <div className="flex flex-1 max-w-2xl items-center gap-2 rounded-lg border border-violet-200 bg-white pl-4 pr-1.5 py-1.5 shadow-sm focus-within:border-violet-300">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Click on any card to get recommendations"
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-500 placeholder:font-medium focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          style={{ background: PURPLE_GRADIENT }}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-white hover:opacity-90 transition-opacity"
          aria-label="Send"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default DashboardAiBar;
