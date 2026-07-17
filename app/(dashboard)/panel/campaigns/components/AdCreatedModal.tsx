"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { GradientSparkle } from "./GradientSparkle";

interface AdCreatedModalProps {
  open: boolean;
  kind: "draft" | "publish";
  navigating?: boolean;
  onPrimary: () => void;
  onCampaigns: () => void;
}

export function AdCreatedModal({
  open,
  kind,
  navigating = false,
  onPrimary,
  onCampaigns,
}: AdCreatedModalProps) {
  if (!open) return null;

  const publishing = kind === "publish";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="campaign-created-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          {publishing ? <GradientSparkle className="h-9 w-9" /> : <CheckCircle2 className="h-8 w-8 text-green-600" />}
        </span>
        <h2 id="campaign-created-title" className="mt-5 text-xl font-bold text-gray-900">
          {publishing ? "Campaign sent for publishing" : "Campaign draft saved"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {publishing
            ? "Growdex accepted the campaign and started publishing it to the selected platforms. The campaigns page will show the provider result."
            : "Your campaign, audience, schedule, and creative are saved. You can reopen the draft without losing your choices."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onPrimary} disabled={navigating} className="inline-flex items-center justify-center gap-2 rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 disabled:opacity-50">
            {navigating && <Loader2 className="h-4 w-4 animate-spin" />}
            {publishing ? "View publishing status" : "Review saved campaign"}
          </button>
          {!publishing && (
            <button type="button" onClick={onCampaigns} disabled={navigating} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Back to campaigns
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdCreatedModal;
