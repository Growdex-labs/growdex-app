"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, SendHorizontal, Pencil, Copy, Check } from "lucide-react";
import { PURPLE_GRADIENT } from "./AiCampaignChat";

export interface AiMessage {
  id: string;
  text: string;
  sender?: "ai" | "user";
  /** Render inside a highlighted bubble with Edit/Copy actions. */
  actionable?: boolean;
}

interface AiSidePanelProps {
  messages?: AiMessage[];
  /** Question the AI is waiting on; when absent, no options are shown. */
  question?: string;
  options?: string[];
  /** Quick-reply chips shown above the input. */
  suggestions?: string[];
  onAnswer?: (selected: string[]) => void;
  onSubmit?: (prompt: string) => void;
}

const DEFAULT_SUGGESTIONS = ["Audience too broad", "Make the copy shorter"];

// Mock conversation matching the design. Swap for real data later.
const DEFAULT_MESSAGES: AiMessage[] = [
  {
    id: "m1",
    text: "Audience can be better optimized. 2 changes discovered for Ad copy.",
    actionable: true,
  },
  {
    id: "m2",
    text: "TikTok is outperforming Meta for on this campaign. We recommend you change the image.",
  },
];

export function AiSidePanel({
  messages = DEFAULT_MESSAGES,
  question,
  options = [],
  suggestions = DEFAULT_SUGGESTIONS,
  onAnswer,
  onSubmit,
}: AiSidePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, boolean>
  >({});

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Reset the selection whenever the AI moves on to a new question.
  useEffect(() => {
    setSelectedOptions({});
  }, [question]);

  // Keep the conversation scrolled to the newest message/question.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, question]);

  const toggleOption = (option: string) =>
    setSelectedOptions((prev) => ({ ...prev, [option]: !prev[option] }));

  const selectedList = options.filter((o) => selectedOptions[o]);

  const confirmSelection = () => {
    if (selectedList.length === 0) return;
    onAnswer?.(selectedList);
  };

  const submit = () => {
    const value = prompt.trim();
    if (!value) return;
    onSubmit?.(value);
    setPrompt("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border-2 border-t-purple-300 border-r-purple-300 border-b-purple-300 border-l-purple-300/40 border-gray-200 shadow-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
        {messages.map((message) => {
          const isUser = message.sender === "user";

          if (message.actionable) {
            return (
              <div key={message.id} className="self-start max-w-[85%]">
                <div className="bg-violet-50 rounded-lg p-3 text-xs leading-relaxed text-gray-700">
                  {message.text}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-gray-600"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-gray-600"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              style={isUser ? { background: PURPLE_GRADIENT } : undefined}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                isUser
                  ? "self-end rounded-br-sm text-white"
                  : "self-start rounded-bl-sm bg-violet-50 text-gray-700"
              }`}
            >
              {message.text}
            </div>
          );
        })}

        {/* Question with gradient-checkbox options (only while the AI waits) */}
        {question && options.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-violet-500 mb-3">
              {question}
            </p>
            <div className="space-y-2">
              {options.map((option) => {
                const checked = Boolean(selectedOptions[option]);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      checked
                        ? "border-violet-300 bg-violet-50/40"
                        : "border-gray-200 hover:border-violet-200"
                    }`}
                  >
                    <span
                      className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-sm border ${
                        checked ? "border-transparent" : "border-gray-300"
                      }`}
                      style={checked ? { background: PURPLE_GRADIENT } : undefined}
                    >
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="text-sm text-gray-700">{option}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmSelection}
              disabled={selectedList.length === 0}
              style={
                selectedList.length > 0
                  ? { background: PURPLE_GRADIENT }
                  : undefined
              }
              className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-medium transition-opacity ${
                selectedList.length > 0
                  ? "text-white hover:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm selection
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Prompt input */}
      <div className="p-3 border-gray-100">
        {/* Quick-reply suggestion chips */}
        {suggestions.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSubmit?.(suggestion)}
                className="rounded-full bg-violet-50 px-3 py-1 text-[11px] text-violet-600 hover:bg-violet-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white pl-3 pr-1.5 py-1.5 focus-within:border-violet-300">
          <button
            type="button"
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Attach a file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
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
            placeholder="Where are we starting from?"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            style={{ background: PURPLE_GRADIENT }}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-white hover:opacity-90 transition-opacity"
            aria-label="Send"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiSidePanel;
