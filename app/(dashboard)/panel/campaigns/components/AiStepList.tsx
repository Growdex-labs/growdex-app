"use client";

import { useState } from "react";
import { Check, Info, Loader2, Pencil, Sparkles, X } from "lucide-react";
import { PURPLE_GRADIENT } from "./ai-campaign-theme";
import type { AiStep, AiStepId } from "./use-ai-campaign-flow";

interface AiStepListProps {
  steps: AiStep[];
  onApprove: (id: AiStepId) => void;
  onDecline: (step: AiStep, instruction: string) => void;
  onEdit: (step: AiStep) => void;
  onWhyThis: (step: AiStep) => void;
  busy?: boolean;
}

const AI_STEP_ORDER: AiStepId[] = [
  "setup",
  "goals",
  "platform",
  "event",
  "audience",
  "budget",
  "creative",
];

export function AiStepList({
  steps,
  onApprove,
  onDecline,
  onEdit,
  onWhyThis,
  busy = false,
}: AiStepListProps) {
  const [decliningId, setDecliningId] = useState<AiStepId | null>(null);
  const [instruction, setInstruction] = useState("");

  const submitRevision = (step: AiStep) => {
    const request = instruction.trim();
    if (!request) return;
    onDecline(step, request);
    setDecliningId(null);
    setInstruction("");
  };

  const orderedSteps = [...steps].sort(
    (left, right) =>
      AI_STEP_ORDER.indexOf(left.id) - AI_STEP_ORDER.indexOf(right.id),
  );

  return (
    <div className="space-y-8 pb-10">
      {orderedSteps.map((step) => (
        <article key={step.id} className="min-w-0">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400">
            <Sparkles className="h-3 w-3" /> {step.title}
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold text-gray-800">
            {step.result}
          </h3>
          <div
            className="mt-2 h-1 rounded-full"
            style={{ background: PURPLE_GRADIENT }}
          />
          {step.detail && (
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {step.detail}
            </p>
          )}
          {step.chips?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {step.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs capitalize text-gray-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-violet-50/80 px-2.5 py-1.5">
            <button
              type="button"
              onClick={() => onWhyThis(step)}
              disabled={busy}
              style={{ background: PURPLE_GRADIENT }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Info className="h-3 w-3" /> Why this?
            </button>

            {step.status === "approved" ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <Check className="h-3.5 w-3.5" /> Approved
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(step)}
                  disabled={busy}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5 text-violet-500" /> Edit
                </button>
              </div>
            ) : step.status === "revising" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Revising with
                AI
              </span>
            ) : (
              <div className="flex items-center gap-4 text-xs text-gray-700">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onApprove(step.id)}
                  className="inline-flex items-center gap-1 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5 text-green-500" /> Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onEdit(step)}
                  className="inline-flex items-center gap-1 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5 text-violet-500" /> Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setDecliningId(step.id);
                    setInstruction("");
                  }}
                  className="inline-flex items-center gap-1 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5 text-red-500" /> Decline
                </button>
              </div>
            )}
          </div>

          {decliningId === step.id && (
            <div className="mt-3 rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
              <label className="text-xs font-medium text-gray-700">
                What should the AI change?
                <textarea
                  autoFocus
                  rows={3}
                  value={instruction}
                  disabled={busy}
                  onChange={(event) => setInstruction(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-violet-300"
                  placeholder="Be specific about the result you want."
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy || !instruction.trim()}
                  onClick={() => submitRevision(step)}
                  style={
                    instruction.trim()
                      ? { background: PURPLE_GRADIENT }
                      : undefined
                  }
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Regenerate with AI
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDecliningId(null)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default AiStepList;
