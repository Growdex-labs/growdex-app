"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import type { AiCampaignQuestion } from "@/lib/campaigns";
import { AiSidePanel, type AiMessage } from "./AiSidePanel";
import { AiStepList } from "./AiStepList";
import { CampaignSkeleton } from "./CampaignSkeleton";
import { CampaignStepper } from "./CampaignStepper";
import { GradientSparkle } from "./GradientSparkle";
import type { AiStep, AiStepId } from "./use-ai-campaign-flow";

const AI_STEPS = [
  "Setup campaign",
  "Set campaign goals",
  "Choose platform",
  "Event management",
  "Budget and schedule",
  "Creative setup",
  "Review and publish",
];

interface AiCampaignWorkspaceProps {
  campaignName: string;
  firstName?: string;
  steps?: AiStep[];
  messages: AiMessage[];
  question?: AiCampaignQuestion | null;
  loading?: boolean;
  allApproved?: boolean;
  error?: string | null;
  approvalBlocker?: string | null;
  disabledReason?: string | null;
  onCampaignNameChange: (name: string) => void;
  onApprove: (id: AiStepId) => void;
  onApproveAll: () => void;
  onDecline: (step: AiStep, instruction: string) => void;
  onEdit: (step: AiStep) => void;
  onWhyThis: (step: AiStep) => void;
  onPrompt: (prompt: string) => void;
  onAnswer: (optionIds: string[]) => void;
  onContinue: () => void;
}

export function AiCampaignWorkspace({
  campaignName,
  firstName,
  steps,
  messages,
  question,
  loading = false,
  allApproved = false,
  error,
  approvalBlocker,
  disabledReason,
  onCampaignNameChange,
  onApprove,
  onApproveAll,
  onDecline,
  onEdit,
  onWhyThis,
  onPrompt,
  onAnswer,
  onContinue,
}: AiCampaignWorkspaceProps) {
  const hasDraft = Boolean(steps?.length);

  return (
    <main className="grid h-full min-w-0 flex-1 grid-rows-[minmax(0,1fr)_22.5rem] overflow-hidden lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="min-w-0 overflow-y-auto px-5 py-4 md:py-6 md:pl-14 md:pr-6">
        <div className="mx-auto max-w-4xl">
          <div>
            <CampaignStepper
              steps={AI_STEPS}
              current={0}
              activeGradient
              compact
            />
          </div>

          <input
            aria-label="Campaign name"
            value={campaignName}
            onChange={(event) => onCampaignNameChange(event.target.value)}
            placeholder="Untitled campaign"
            className="mt-4 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-violet-300"
          />

          {error && (
            <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {!hasDraft && !loading && !question && (
            <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
              <GradientSparkle className="h-9 w-9" />
              <h1 className="mt-5 text-2xl font-semibold text-gray-800">
                Hello{firstName ? ` ${firstName}` : ""}, let&apos;s create your
                campaign
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                Describe the outcome in the assistant. Your campaign decisions
                will appear here as Growdex AI builds them.
              </p>
            </div>
          )}

          {!hasDraft && loading && (
            <div className="mt-9 space-y-8" aria-live="polite">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Growdex AI is
                building your campaign
              </div>
              <CampaignSkeleton className="h-20 w-full" />
              <CampaignSkeleton className="h-20 w-full" />
              <CampaignSkeleton className="h-20 w-4/5" />
            </div>
          )}

          {!hasDraft && question && (
            <div className="mt-10 max-w-2xl">
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400">
                <Sparkles className="h-3 w-3" /> Campaign setup paused
              </div>
              <h2 className="mt-3 text-xl font-semibold text-gray-800">
                Growdex AI needs one decision before it can continue
              </h2>
              <div className="mt-4 h-1 rounded-full bg-violet-200" />
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Choose an option in the assistant. The same saved draft will
                continue without restarting your campaign.
              </p>
            </div>
          )}

          {hasDraft && steps && (
            <div className="mt-5">
              <AiStepList
                steps={steps}
                onApprove={onApprove}
                onDecline={onDecline}
                onEdit={onEdit}
                onWhyThis={onWhyThis}
                busy={loading}
              />

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 py-4">
                {approvalBlocker && !allApproved && (
                  <p className="mr-auto max-w-sm text-xs leading-5 text-amber-700">
                    {approvalBlocker}
                  </p>
                )}
                <button
                  type="button"
                  onClick={allApproved ? onContinue : onApproveAll}
                  disabled={
                    loading || (!allApproved && Boolean(approvalBlocker))
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {allApproved && <Check className="h-4 w-4" />}
                  {allApproved ? "Open full editor" : "Approve all decisions"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="h-[22.5rem] min-w-0 border-t border-violet-100 bg-white/70 p-3 lg:h-full lg:border-l lg:border-t-0 lg:p-4 xl:px-4 xl:py-8">
        <AiSidePanel
          messages={messages}
          question={question?.prompt}
          options={question?.options}
          allowMultiple={question?.allowMultiple}
          suggestions={
            hasDraft
              ? []
              : [
                  "Launch a lead campaign in Nigeria",
                  "Promote a new product",
                  "Drive visitors to my website",
                ]
          }
          onAnswer={onAnswer}
          onSubmit={onPrompt}
          submitting={loading}
          error={error}
          disabledReason={disabledReason}
        />
      </aside>
    </main>
  );
}

export default AiCampaignWorkspace;
