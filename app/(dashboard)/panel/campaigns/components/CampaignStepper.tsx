"use client";

import { PURPLE_GRADIENT } from "./AiCampaignChat";

interface CampaignStepperProps {
  steps: string[];
  current: number; // index of the active step
  onStepClick?: (index: number) => void;
  /** When true, the active step bar uses the purple gradient instead of khaki. */
  activeGradient?: boolean;
}

export function CampaignStepper({
  steps,
  current,
  onStepClick,
  activeGradient = false,
}: CampaignStepperProps) {
  return (
    <div className="flex items-start gap-3 overflow-x-auto hide-scrollbar">
      {steps.map((step, index) => {
        const isActive = index === current;
        const isDone = index < current;
        const isUnavailable = index > current;
        return (
          <button
            key={step}
            type="button"
            disabled={isUnavailable}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onStepClick?.(index)}
            className="flex min-w-[108px] flex-1 flex-col gap-2 text-left disabled:cursor-not-allowed md:min-w-20"
          >
            <span
              className={`whitespace-nowrap text-[10px] transition-colors 2xl:text-xs ${
                isActive
                  ? "font-semibold text-gray-900"
                  : isDone
                    ? "text-gray-600"
                    : "text-gray-300"
              }`}
            >
              {step}
            </span>
            <span
              className={`h-1 rounded-full transition-colors ${
                isActive
                  ? activeGradient
                    ? ""
                    : "bg-khaki-200"
                  : isDone
                    ? "bg-khaki-300"
                    : "bg-gray-200"
              }`}
              style={
                isActive && activeGradient
                  ? { background: PURPLE_GRADIENT }
                  : undefined
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default CampaignStepper;
