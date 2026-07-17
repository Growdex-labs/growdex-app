"use client";

import { Loader2, Sparkles } from "lucide-react";
import { CampaignSkeleton } from "./CampaignSkeleton";

const GENERATION_STEPS = [
  "Understand your request",
  "Choose the campaign goal and platforms",
  "Build the audience, budget, and schedule",
  "Write an editable creative draft",
];

interface AiWorkingViewProps {
  campaignName: string;
}

export function AiWorkingView({ campaignName }: AiWorkingViewProps) {
  return (
    <section className="grid min-h-96 gap-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_280px] md:p-8" aria-live="polite">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
          <Sparkles className="h-4 w-4" /> Growdex AI is building your campaign
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          {campaignName.trim() || "Your campaign draft"}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
          This progress follows the live generation request. As soon as the AI returns, every choice opens in the normal editor for review.
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

export default AiWorkingView;
