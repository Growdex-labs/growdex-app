"use client";

import { Loader2, Sparkles } from "lucide-react";
import { CampaignSkeleton } from "./CampaignSkeleton";
import { AiSidePanel, type AiMessage } from "./AiSidePanel";
import { AiStepList } from "./AiStepList";
import type { AiStep, AiStepId } from "./use-ai-campaign-flow";
import type { AiCampaignQuestion } from "@/lib/campaigns";

interface AiWorkingViewProps {
  campaignName: string;
  steps?: AiStep[];
  messages?: AiMessage[];
  allApproved?: boolean;
  revising?: boolean;
  question?: AiCampaignQuestion | null;
  error?: string | null;
  approvalBlocker?: string | null;
  onApprove?: (id: AiStepId) => void;
  onApproveAll?: () => void;
  onDecline?: (step: AiStep, instruction: string) => void;
  onEdit?: (step: AiStep) => void;
  onWhyThis?: (step: AiStep) => void;
  onPrompt?: (prompt: string) => void;
  onAnswer?: (optionIds: string[]) => void;
  onContinue?: () => void;
}

export function AiWorkingView({
  campaignName,
  steps,
  messages = [],
  allApproved = false,
  revising = false,
  question,
  error,
  approvalBlocker,
  onApprove,
  onApproveAll,
  onDecline,
  onEdit,
  onWhyThis,
  onPrompt,
  onAnswer,
  onContinue,
}: AiWorkingViewProps) {
  if (!steps && question) {
    return (
      <section className="mx-auto grid min-h-[520px] max-w-4xl gap-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_360px] md:p-8">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Sparkles className="h-4 w-4" /> Growdex AI needs one decision
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">A better brief makes a safer campaign</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-gray-500">
            The assistant paused instead of guessing. Choose the option that matches your intent and it will continue the same draft.
          </p>
        </div>
        <div className="h-[440px]">
          <AiSidePanel
            question={question.prompt}
            options={question.options}
            allowMultiple={question.allowMultiple}
            onAnswer={onAnswer}
            submitting={revising}
            error={error}
          />
        </div>
      </section>
    );
  }

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
            The assistant is checking your connected accounts, campaign rules, audience, budget, and platform-specific creative needs. It will pause if a decision cannot be made safely.
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-600">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">Building one validated draft</p>
              <p className="mt-0.5 text-xs text-gray-500">This is one live request, not simulated stage progress.</p>
            </div>
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
          onClick={allApproved ? onContinue : onApproveAll}
          disabled={revising || (!allApproved && Boolean(approvalBlocker))}
          className="rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allApproved ? "Open full editor" : "Approve all decisions"}
        </button>
        {approvalBlocker && !allApproved && (
          <p className="max-w-xs text-right text-xs leading-5 text-amber-700">{approvalBlocker}</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="max-h-[680px] overflow-y-auto pr-1">
          <AiStepList
            steps={steps}
            onApprove={(id) => onApprove?.(id)}
            onDecline={(step, instruction) => onDecline?.(step, instruction)}
            onEdit={(step) => onEdit?.(step)}
            onWhyThis={(step) => onWhyThis?.(step)}
            busy={revising}
          />
        </div>
        <div className="h-[620px]">
          <AiSidePanel
            messages={messages}
            question={question?.prompt}
            options={question?.options}
            allowMultiple={question?.allowMultiple}
            onAnswer={onAnswer}
            suggestions={[
              "Narrow the audience",
              "Make the copy shorter",
              "Lower the daily budget",
            ]}
            onSubmit={onPrompt}
            submitting={revising}
            error={error}
          />
        </div>
      </div>
    </section>
  );
}

export default AiWorkingView;
