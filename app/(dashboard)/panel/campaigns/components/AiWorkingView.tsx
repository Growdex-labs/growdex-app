"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AiStepList } from "./AiStepList";
import { AiSidePanel, type AiMessage } from "./AiSidePanel";
import { AdCreatedModal } from "./AdCreatedModal";
import { useAiCampaignFlow, type AiStep } from "./use-ai-campaign-flow";

interface AiWorkingViewProps {
  campaignName: string;
  onCampaignNameChange: (value: string) => void;
  /** The stepper element, rendered inside the left column. */
  stepper: ReactNode;
  onSetupCreative?: () => void;
  onGoalSelected?: (goal: string) => void;
}

// Seed the conversation with the AI's opening insights.
const INITIAL_MESSAGES: AiMessage[] = [
  {
    id: "m1",
    sender: "ai",
    text: "Audience can be better optimized. 2 changes discovered for Ad copy.",
    actionable: true,
  },
  {
    id: "m2",
    sender: "ai",
    text: "TikTok is outperforming Meta for on this campaign. We recommend you change the image.",
  },
];

export function AiWorkingView({
  campaignName,
  onCampaignNameChange,
  stepper,
  onSetupCreative,
  onGoalSelected,
}: AiWorkingViewProps) {
  const {
    steps,
    approve,
    decline,
    updateReason,
    activeQuestion,
    answerQuestion,
    allDone,
  } = useAiCampaignFlow();

  // Show the "ad created" modal once, when every step has finished.
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const announced = useRef(false);
  useEffect(() => {
    if (allDone && !announced.current) {
      announced.current = true;
      setShowCreatedModal(true);
    }
  }, [allDone]);

  const [messages, setMessages] = useState<AiMessage[]>(INITIAL_MESSAGES);
  const messageId = useRef(INITIAL_MESSAGES.length);

  const addMessage = (message: Omit<AiMessage, "id">) =>
    setMessages((prev) => [
      ...prev,
      { ...message, id: `m${(messageId.current += 1)}` },
    ]);

  // "Why this?" now answers in the chat instead of inline on the canvas.
  const explainStep = (step: AiStep) => {
    addMessage({ sender: "user", text: `Why "${step.title}"?` });
    addMessage({ sender: "ai", text: step.reason });
  };

  const handleUserPrompt = (text: string) => {
    addMessage({ sender: "user", text });
    addMessage({
      sender: "ai",
      text: "Got it — I'll factor that into the campaign.",
    });
  };

  return (
    <div className="flex gap-6 items-stretch">
      <div className="flex-1 min-w-0">
        {/* Stepper sits in the left column so the panel stands beside it */}
        <div className="mb-8">{stepper}</div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => onCampaignNameChange(e.target.value)}
              maxLength={100}
              placeholder="Untitled Campaign"
              className="block w-full text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <AiStepList
            steps={steps}
            onApprove={approve}
            onDecline={decline}
            onUpdateReason={updateReason}
            onWhyThis={explainStep}
          />

          {/* Final actions once every step has generated */}
          {allDone && (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onSetupCreative}
                className="rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
              >
                Setup creative
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Preview ad
              </button>
            </div>
          )}
        </div>
      </div>

      <aside className="w-[340px] shrink-0 self-stretch sticky top-6 h-[calc(100vh-9rem)]">
        <AiSidePanel
          messages={messages}
          question={activeQuestion?.question}
          options={activeQuestion?.options}
          onAnswer={(selected) => {
            if (!activeQuestion) return;
            if (activeQuestion.id === "goals" && selected[0]) {
              onGoalSelected?.(selected[0]);
            }
            answerQuestion(activeQuestion.id, selected);
          }}
          onSubmit={handleUserPrompt}
        />
      </aside>

      <AdCreatedModal
        open={showCreatedModal}
        onClose={() => setShowCreatedModal(false)}
        onSetupCreative={() => {
          setShowCreatedModal(false);
          onSetupCreative?.();
        }}
      />
    </div>
  );
}

export default AiWorkingView;
