"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { AiPromptComposer } from "./AiPromptComposer";
import { PURPLE_GRADIENT } from "./ai-campaign-theme";

export interface AiMessage {
  id: string;
  text: string;
  sender?: "ai" | "user";
}

export interface AiSelectableOption {
  id: string;
  label: string;
  description?: string;
}

interface AiSidePanelProps {
  messages?: AiMessage[];
  /** Question the AI is waiting on; when absent, no options are shown. */
  question?: string;
  options?: AiSelectableOption[];
  allowMultiple?: boolean;
  /** Quick-reply chips shown above the input. */
  suggestions?: string[];
  onAnswer?: (selected: string[]) => void;
  onSubmit?: (prompt: string) => void;
  submitting?: boolean;
  error?: string | null;
  disabledReason?: string | null;
}

export function AiSidePanel({
  messages = [],
  question,
  options = [],
  allowMultiple = false,
  suggestions = [],
  onAnswer,
  onSubmit,
  submitting = false,
  error,
  disabledReason,
}: AiSidePanelProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, boolean>
  >({});

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Keep the conversation scrolled to the newest message/question.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, question]);

  const toggleOption = (optionId: string) =>
    setSelectedOptions((prev) =>
      allowMultiple
        ? { ...prev, [optionId]: !prev[optionId] }
        : { [optionId]: !prev[optionId] },
    );

  const selectedList = options.filter((option) => selectedOptions[option.id]);

  const confirmSelection = () => {
    if (selectedList.length === 0) return;
    onAnswer?.(selectedList.map((option) => option.id));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border-2 border-t-purple-300 border-r-purple-300 border-b-purple-300 border-l-purple-300/40 border-gray-200 shadow-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 hide-scrollbar">
        {messages.length === 0 && !question && (
          <div className="rounded-xl bg-violet-50 px-5 py-4 text-sm leading-6 text-violet-700 xl:text-base xl:leading-7">
            Describe the campaign you want to launch. Growdex AI will build each
            decision here and pause whenever it needs your input.
          </div>
        )}
        {messages.map((message) => {
          const isUser = message.sender === "user";

          return (
            <div
              key={message.id}
              style={isUser ? { background: PURPLE_GRADIENT } : undefined}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 xl:text-base xl:leading-7 ${
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
            <p className="mb-3 text-sm font-medium text-violet-500 xl:text-base">
              {question}
            </p>
            <div className="space-y-2">
              {options.map((option) => {
                const checked = Boolean(selectedOptions[option.id]);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    disabled={submitting || Boolean(disabledReason)}
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
                      style={
                        checked ? { background: PURPLE_GRADIENT } : undefined
                      }
                    >
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>
                      <span className="block text-base text-gray-700">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-0.5 block text-sm text-gray-500">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmSelection}
              disabled={
                submitting ||
                Boolean(disabledReason) ||
                selectedList.length === 0
              }
              style={
                selectedList.length > 0
                  ? { background: PURPLE_GRADIENT }
                  : undefined
              }
              className={`mt-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-opacity ${
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
      <div className="p-4 border-gray-100">
        <AiPromptComposer
          suggestions={suggestions}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
          disabledReason={disabledReason}
        />
      </div>
    </div>
  );
}

export default AiSidePanel;
