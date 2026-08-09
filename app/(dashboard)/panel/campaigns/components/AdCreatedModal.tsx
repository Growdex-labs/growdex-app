"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { GradientSparkle } from "./GradientSparkle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) primaryRef.current?.focus();
  }, [open]);

  const publishing = kind === "publish";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Dismissing lands on the campaigns list, which is always a safe place
        // to end up once the campaign itself has been saved.
        if (!next && !navigating) onCampaigns();
      }}
    >
      <DialogContent className="text-center sm:max-w-md">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          {publishing ? (
            <GradientSparkle className="h-9 w-9" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          )}
        </span>

        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {publishing
              ? "Campaign sent for publishing"
              : "Campaign draft saved"}
          </DialogTitle>
          <DialogDescription className="text-center leading-6">
            {publishing
              ? "Growdex accepted the campaign and started publishing it to the selected platforms. The campaigns page will show the provider result."
              : "Your campaign, audience, schedule, and creative are saved. You can reopen the draft without losing your choices."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            ref={primaryRef}
            type="button"
            onClick={onPrimary}
            disabled={navigating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-gilroy-medium text-gray-900 hover:bg-khaki-300 disabled:opacity-50"
          >
            {navigating && <Loader2 className="h-4 w-4 animate-spin" />}
            {publishing ? "View publishing status" : "Review saved campaign"}
          </button>
          {!publishing && (
            <button
              type="button"
              onClick={onCampaigns}
              disabled={navigating}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-gilroy-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back to campaigns
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdCreatedModal;
