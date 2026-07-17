"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { GradientSparkle } from "./GradientSparkle";

export const PURPLE_GRADIENT =
  "linear-gradient(90deg, #E0B2FF 0%, #BE67F9 100%)";

interface AiCampaignChatProps {
  firstName?: string;
  onSubmit?: (prompt: string) => void;
  onPromptChange?: (value: string) => void;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Campaign for Real Estate",
  "Re-targeting campaign",
  "Lead generation campaign for newsletter",
];

export function AiCampaignChat({
  firstName,
  onSubmit,
  onPromptChange,
  suggestions = DEFAULT_SUGGESTIONS,
}: AiCampaignChatProps) {
  const [prompt, setPrompt] = useState("");

  const greetingName = firstName?.trim() ? `${firstName.trim()}, ` : "";

  const updatePrompt = (value: string) => {
    setPrompt(value);
    onPromptChange?.(value);
  };

  const submit = () => {
    const value = prompt.trim();
    if (!value) return;
    onSubmit?.(value);
  };

  return (
    <div className="flex flex-col items-center text-center py-16 md:py-24">
      <GradientSparkle className="w-9 h-9 mb-6" />

      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10">
        Hello {greetingName}let&apos;s create your campaign
      </h2>

      {/* Prompt input */}
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white pl-4 pr-2 py-2 shadow-sm focus-within:border-violet-300">
          <input
            type="text"
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Where are we starting from?"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
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

        {/* Suggestion chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updatePrompt(s)}
              className="rounded-lg bg-violet-50 px-4 py-2 text-xs text-violet-600 hover:bg-violet-100 transition-colors max-w-[220px]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AiCampaignChat;
