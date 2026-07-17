"use client";

import { Loader2, Sparkles } from "lucide-react";
import { CampaignSkeleton } from "./CampaignSkeleton";
import { AiSidePanel, type AiMessage } from "./AiSidePanel";
import { AiStepList } from "./AiStepList";
import type { AiStep, AiStepId } from "./use-ai-campaign-flow";

const GENERATION_STEPS = [
  "Understand your request",
  "Choose the campaign goal and platforms",
  "Build the audience, budget, and schedule",
  "Write an editable creative draft",
];

interface AiWorkingViewProps {
  campaignName: string;
  steps?: AiStep[];
  messages?: AiMessage[];
  allApproved?: boolean;
  revising?: boolean;
  onApprove?: (id: AiStepId) => void;
  onDecline?: (step: AiStep, instruction: string) => void;
  onEdit?: (step: AiStep) => void;
  onWhyThis?: (step: AiStep) => void;
  onPrompt?: (prompt: string) => void;
  onContinue?: () => void;
}

export function AiWorkingView({
  campaignName,
  steps,
  messages = [],
  allApproved = false,
  revising = false,
  onApprove,
  onDecline,
  onEdit,
  onWhyThis,
  onPrompt,
  onContinue,
}: AiWorkingViewProps) {
  if (!steps) {
    return (
      <section
        className="grid min-h-96 gap-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_280px] md:p-8"
        aria-live="polite"
      >
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Sparkles className="h-4 w-4" /> Growdex AI is building your
            campaign
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {campaignName.trim() || "Your campaign draft"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            This progress reflects one live AI request. The decisions will
            appear for approval as soon as the structured draft returns.
          </p>
          <div className="mt-7 space-y-3">
            {GENERATION_STEPS.map((label) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl bg-violet-50/70 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">Draft preview</p>
          <CampaignSkeleton className="mt-4 w-full" />
          <CampaignSkeleton className="mt-3 h-24 w-full" />
          <CampaignSkeleton className="mt-3 h-10 w-2/3" />
        </aside>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Sparkles className="h-4 w-4" /> AI campaign review
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {campaignName || "Your campaign draft"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Approve each decision, open its real editor, or ask the model to
            regenerate the draft with specific feedback.
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={!allApproved || revising}
          className="rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allApproved ? "Open full editor" : "Approve all decisions"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="max-h-[680px] overflow-y-auto pr-1">
          <AiStepList
            steps={steps}
            onApprove={(id) => onApprove?.(id)}
            onDecline={(step, instruction) => onDecline?.(step, instruction)}
            onEdit={(step) => onEdit?.(step)}
            onWhyThis={(step) => onWhyThis?.(step)}
          />
        </div>
        <div className="h-[620px]">
          <AiSidePanel
            messages={messages}
            suggestions={[
              "Narrow the audience",
              "Make the copy shorter",
              "Lower the daily budget",
            ]}
            onSubmit={onPrompt}
          />
        </div>
      </div>
    </section>
  );
}

export default AiWorkingView;
