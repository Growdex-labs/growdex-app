"use client";

import { Check } from "lucide-react";

export const INSIGHT_ACTIONS = [
  {
    id: "creative",
    label: "Change creative",
    prompt: "Suggest creative changes that would improve click-through rate.",
  },
  {
    id: "cta",
    label: "Rewrite call to action",
    prompt: "Rewrite the call to action to improve click-through rate.",
  },
  {
    id: "detail",
    label: "Tell us in detail",
    prompt: "Explain the click-through rate in more detail and what to do next.",
  },
] as const;

export type InsightActionId = (typeof INSIGHT_ACTIONS)[number]["id"];

interface RecommendedActionsProps {
  selectedId: string | null;
  onSelect: (action: (typeof INSIGHT_ACTIONS)[number]) => void;
  disabled?: boolean;
}

export function RecommendedActions({
  selectedId,
  onSelect,
  disabled = false,
}: RecommendedActionsProps) {
  return (
    <section className="mt-6">
      <p className="font-inter text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">
        + Recommended actions
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {INSIGHT_ACTIONS.map((action) => {
          const selected = selectedId === action.id;
          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(action)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-gilroy-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "border-violet-300 bg-violet-50 text-violet-950"
                  : "border-gray-200 bg-white text-gray-700 hover:border-violet-200"
              }`}
            >
              {action.label}
              {selected && <Check className="size-4 shrink-0 text-violet-600" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
