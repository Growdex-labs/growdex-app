"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AiSidePanel,
  type AiMessage,
} from "../campaigns/components/AiSidePanel";
import type { CampaignAdviceAction } from "@/lib/campaigns";

export type { AiMessage };

export const CAMPAIGN_ASSISTANT_SUGGESTIONS = [
  "Why are my campaigns not performing well?",
  "Which campaign is spending the most?",
  "What should I optimize first?",
];

interface CampaignsAiPanelProps {
  open: boolean;
  onClose: () => void;
  messages: AiMessage[];
  onSend: (text: string) => void;
  loading?: boolean;
  error?: string | null;
  onTakeAction?: (message: AiMessage, action: CampaignAdviceAction) => void;
}

export function CampaignsAiPanel({
  open,
  onClose,
  messages,
  onSend,
  loading = false,
  error,
  onTakeAction,
}: CampaignsAiPanelProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b border-gray-100 px-5 py-4 text-left">
          <SheetTitle className="font-gilroy-semibold text-gray-950">
            Campaign assistant
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            Ask about performance across your campaigns. Answers use your live
            stats.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 p-4">
          <AiSidePanel
            messages={messages}
            onSubmit={onSend}
            submitting={loading}
            error={error}
            suggestions={
              messages.length === 0 ? CAMPAIGN_ASSISTANT_SUGGESTIONS : []
            }
            emptyState="Ask why a campaign is underperforming, which one is spending the most, or what to change next. Growdex answers from your campaign stats."
            placeholder="Ask about your campaigns"
            onTakeAction={onTakeAction}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
