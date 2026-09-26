"use client";

import { X } from "lucide-react";
import {
  AiSidePanel,
  type AiMessage,
} from "../campaigns/components/AiSidePanel";
import type { CampaignAdviceAction } from "@/lib/campaigns";

export type { AiMessage };

interface DashboardAiPanelProps {
  messages: AiMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  disabledReason?: string | null;
  onTakeAction?: (message: AiMessage, action: CampaignAdviceAction) => void;
}

export function DashboardAiPanel({
  messages,
  onSend,
  onClose,
  loading = false,
  error,
  disabledReason,
  onTakeAction,
}: DashboardAiPanelProps) {
  return (
    <aside className="fixed inset-x-0 top-16 bottom-0 z-30 w-full bg-white p-2 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100dvh-8rem)] lg:w-[360px] lg:shrink-0 lg:self-stretch lg:bg-transparent lg:p-0">
    <aside className="fixed inset-x-0 top-16 bottom-0 z-30 w-full bg-white p-2 pb-24 sm:p-4 sm:pb-24 lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100dvh-8rem)] lg:w-[360px] lg:shrink-0 lg:self-stretch lg:bg-transparent lg:p-0">
      <div className="relative h-full">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-1 text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Same chat panel used in the new-campaign flow */}
        <AiSidePanel
          messages={messages}
          onSubmit={onSend}
          submitting={loading}
          error={error}
          disabledReason={disabledReason}
          onTakeAction={onTakeAction}
        />
      </div>
    </aside>
  );
}

export default DashboardAiPanel;
