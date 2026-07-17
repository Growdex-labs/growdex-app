"use client";

import { useState } from "react";
import { Check, Info, Loader2, Pencil, Sparkles, X } from "lucide-react";
import { PURPLE_GRADIENT } from "./AiCampaignChat";
import type { AiStep, AiStepId } from "./use-ai-campaign-flow";

interface AiStepListProps {
  steps: AiStep[];
  onApprove: (id: AiStepId) => void;
  onDecline: (step: AiStep, instruction: string) => void;
  onEdit: (step: AiStep) => void;
  onWhyThis: (step: AiStep) => void;
}

export function AiStepList({
  steps,
  onApprove,
  onDecline,
  onEdit,
  onWhyThis,
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

  return (
    <div className="space-y-5">
      {steps.map((step) => (
        <article key={step.id} className="rounded-2xl border border-gray-100 p-4">
          <div className="inline-flex items-center gap-1 text-xs font-medium text-violet-500">
            <Sparkles className="h-3.5 w-3.5" /> {step.label}
          </div>
          <h3 className="mt-2 text-sm font-bold text-violet-700">
            {step.result}
          </h3>
          <div className="mt-2 h-1.5 rounded-full" style={{ background: PURPLE_GRADIENT }} />
          {step.detail && (
            <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs leading-relaxed text-gray-700">
              {step.detail}
            </p>
          )}
          {step.chips?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {step.chips.map((chip) => (
                <span key={chip} className="rounded-md border border-gray-200 px-3 py-1 text-xs capitalize text-gray-600">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-violet-50 px-3 py-2">
            <button
              type="button"
              onClick={() => onWhyThis(step)}
              style={{ background: PURPLE_GRADIENT }}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
            >
              <Info className="h-3 w-3" /> Why this?
            </button>

            {step.status === "approved" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <Check className="h-3.5 w-3.5" /> Approved
              </span>
            ) : step.status === "revising" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Revising with AI
              </span>
            ) : (
              <div className="flex items-center gap-4 text-xs text-gray-700">
                <button type="button" onClick={() => onApprove(step.id)} className="inline-flex items-center gap-1 hover:text-gray-900">
                  <Check className="h-3.5 w-3.5 text-green-500" /> Approve
                </button>
                <button type="button" onClick={() => onEdit(step)} className="inline-flex items-center gap-1 hover:text-gray-900">
                  <Pencil className="h-3.5 w-3.5 text-violet-500" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecliningId(step.id);
                    setInstruction("");
                  }}
                  className="inline-flex items-center gap-1 hover:text-gray-900"
                >
                  <X className="h-3.5 w-3.5 text-red-500" /> Revise
                </button>
              </div>
            )}
          </div>

          {decliningId === step.id && (
            <div className="mt-3 rounded-xl border border-violet-100 p-3">
              <label className="text-xs font-medium text-gray-700">
                What should the AI change?
                <textarea
                  autoFocus
                  rows={3}
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-violet-300"
                  placeholder="Be specific about the result you want."
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={!instruction.trim()}
                  onClick={() => submitRevision(step)}
                  style={instruction.trim() ? { background: PURPLE_GRADIENT } : undefined}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Regenerate with AI
                </button>
                <button type="button" onClick={() => setDecliningId(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
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
