"use client";

import { X } from "lucide-react";
import {
  AiSidePanel,
  type AiMessage,
} from "../campaigns/components/AiSidePanel";

export type { AiMessage };

interface DashboardAiPanelProps {
  messages: AiMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export function DashboardAiPanel({
  messages,
  onSend,
  onClose,
  loading = false,
  error,
}: DashboardAiPanelProps) {
  return (
    <aside className="h-[calc(100vh-8rem)] w-full shrink-0 self-stretch lg:sticky lg:top-6 lg:w-[360px]">
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
        />
      </div>
    </aside>
  );
}

export default DashboardAiPanel;
