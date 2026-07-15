"use client";

import { useState } from "react";
import { Sparkles, Info, Check, Pencil, X } from "lucide-react";
import { PURPLE_GRADIENT } from "./AiCampaignChat";
import { CampaignSkeleton } from "./CampaignSkeleton";
import type { AiStep } from "./use-ai-campaign-flow";

interface AiStepListProps {
  steps: AiStep[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onUpdateReason: (id: string, reason: string) => void;
  onWhyThis: (step: AiStep) => void;
}

export function AiStepList({
  steps,
  onApprove,
  onDecline,
  onUpdateReason,
  onWhyThis,
}: AiStepListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const startEdit = (step: AiStep) => {
    setEditingId(step.id);
    setEditDraft(step.reason);
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdateReason(editingId, editDraft);
    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      {steps.map((step) => {
        if (step.status === "pending") return null;
        const isEditing = editingId === step.id;
        return (
          <div key={step.id}>
            {/* Step label */}
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {step.label}
            </button>

            {step.status === "loading" ? (
              <CampaignSkeleton className="mt-3" />
            ) : step.status === "awaiting" ? (
              // Interactive step: waiting for the user's selection in the panel.
              <h3 className="mt-2 text-base font-bold text-gray-900">
                {step.question}
              </h3>
            ) : (
              <div className="mt-2">
                <h3 className="text-sm font-bold text-violet-600 mb-2">
                  {step.result ?? `${step.title} complete`}
                </h3>

                <div
                  className="h-1.5 rounded-full"
                  style={{ background: PURPLE_GRADIENT }}
                />

                {/* Optional detail line under the bar */}
                {step.detail && (
                  <div className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-gray-700">
                    {step.detail}
                  </div>
                )}

                {/* Optional chips (e.g. age range) under the bar */}
                {step.chips && step.chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {step.status === "review" ? (
                  <div
                    className="mt-3 flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2"
                    style={{
                      border: "0.25px solid transparent",
                      borderImageSource: PURPLE_GRADIENT,
                      borderImageSlice: 1,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onWhyThis(step)}
                      style={{ background: PURPLE_GRADIENT }}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white hover:opacity-90"
                    >
                      <Info className="w-3 h-3" />
                      Why this?
                    </button>

                    <div className="flex items-center gap-4 text-xs text-gray-700">
                      <button
                        type="button"
                        onClick={() => onApprove(step.id)}
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                      >
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(step)}
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                      >
                        <Pencil className="w-3.5 h-3.5 text-violet-500" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecline(step.id)}
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                        Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="w-3.5 h-3.5" />
                    Approved
                  </div>
                )}

                {/* Inline edit */}
                {isEditing && (
                  <div className="mt-3">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-700 focus:border-violet-300 focus:outline-none"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        style={{ background: PURPLE_GRADIENT }}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AiStepList;
