"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { PURPLE_GRADIENT } from "./ai-campaign-theme";

interface AiPromptComposerProps {
  suggestions?: string[];
  onSubmit?: (prompt: string) => void;
  submitting?: boolean;
  error?: string | null;
  disabledReason?: string | null;
  variant?: "panel" | "welcome";
}

export function AiPromptComposer({
  suggestions = [],
  onSubmit,
  submitting = false,
  error,
  disabledReason,
  variant = "panel",
}: AiPromptComposerProps) {
  const [prompt, setPrompt] = useState("");
  const isWelcome = variant === "welcome";

  const submit = (value = prompt) => {
    const request = value.trim();
    if (!request || disabledReason || submitting) return;
    onSubmit?.(request);
    setPrompt("");
  };

  const suggestionsView = suggestions.length > 0 && (
    <div
      className={
        isWelcome ? "mt-4 grid w-full gap-3 md:grid-cols-3" : "mb-3 grid gap-2"
      }
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => submit(suggestion)}
          disabled={submitting || Boolean(disabledReason)}
          className={`w-full bg-violet-50 px-4 text-center text-violet-600 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 ${
            isWelcome
              ? "min-h-14 rounded-xl text-sm md:text-base"
              : "rounded-full py-2.5 text-sm xl:text-base"
          }`}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );

  const inputView = (
    <div
      className={`flex items-center gap-3 border bg-white focus-within:border-violet-400 ${
        isWelcome
          ? "rounded-xl border-violet-300 py-2 pl-5 pr-2 shadow-sm"
          : "rounded-xl border-gray-200 py-2 pl-4 pr-2"
      }`}
    >
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
        placeholder="Where are we starting from?"
        disabled={submitting || Boolean(disabledReason)}
        className={`min-w-0 flex-1 bg-transparent text-gray-700 placeholder:text-gray-400 focus:outline-none disabled:opacity-60 ${
          isWelcome ? "text-base md:text-lg" : "text-sm xl:text-base"
        }`}
      />
      <button
        type="button"
        onClick={() => submit()}
        disabled={submitting || Boolean(disabledReason) || !prompt.trim()}
        style={{ background: PURPLE_GRADIENT }}
        className={`flex shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
          isWelcome ? "h-12 w-12" : "h-10 w-10"
        }`}
        aria-label="Send"
      >
        <SendHorizontal className={isWelcome ? "h-6 w-6" : "h-5 w-5"} />
      </button>
    </div>
  );

  return (
    <div className={isWelcome ? "w-full max-w-4xl" : "w-full"}>
      {submitting && <p className="mb-2 text-sm text-violet-600">Thinking…</p>}
      {(error || disabledReason) && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || disabledReason}
        </p>
      )}
      {isWelcome ? (
        <>
          {inputView}
          {suggestionsView}
        </>
      ) : (
        <>
          {suggestionsView}
          {inputView}
        </>
      )}
    </div>
  );
}

export default AiPromptComposer;
