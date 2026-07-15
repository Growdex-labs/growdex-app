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
}

export function DashboardAiPanel({
  messages,
  onSend,
  onClose,
}: DashboardAiPanelProps) {
  return (
    <aside className="w-full lg:w-[360px] shrink-0 self-stretch sticky top-6 h-[calc(100vh-8rem)]">
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
        <AiSidePanel messages={messages} onSubmit={onSend} />
      </div>
    </aside>
  );
}

export default DashboardAiPanel;
