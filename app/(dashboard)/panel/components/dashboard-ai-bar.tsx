"use client";

import { useState } from "react";
import { SendHorizontal, ChevronDown } from "lucide-react";
import { PURPLE_GRADIENT } from "../campaigns/components/AiCampaignChat";

interface DashboardAiBarProps {
  campaigns: Array<{ id: string; name: string }>;
  selectedCampaignId: string;
  onSend: (text: string) => void;
  onSelectCampaign: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function DashboardAiBar({
  campaigns,
  selectedCampaignId,
  onSend,
  onSelectCampaign,
  loading = false,
  error,
}: DashboardAiBarProps) {
  const [prompt, setPrompt] = useState("");

  const submit = () => {
    const value = prompt.trim();
    if (!value || !selectedCampaignId || loading) return;
    onSend(value);
    setPrompt("");
  };

  return (
    <div className="sticky bottom-4 z-20 mt-6 px-4">
      {error && (
        <p className="mx-auto mb-2 max-w-3xl rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="flex items-center justify-center gap-2">
        <div className="relative">
          <select
            value={selectedCampaignId}
            onChange={(event) => onSelectCampaign(event.target.value)}
            className="appearance-none rounded-lg bg-gray-100 py-3.5 pl-4 pr-8 text-sm text-gray-600 focus:outline-none"
          >
            <option value="">Select a campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex max-w-2xl flex-1 items-center gap-2 rounded-lg border border-violet-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm focus-within:border-violet-300">
          <input
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ask anything about this campaign"
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:font-medium placeholder:text-gray-500 focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!selectedCampaignId || loading || !prompt.trim()}
            style={{ background: PURPLE_GRADIENT }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardAiBar;
