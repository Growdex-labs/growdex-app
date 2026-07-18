"use client";

import { PURPLE_GRADIENT } from "./ai-campaign-theme";

interface CampaignStepperProps {
  steps: string[];
  current: number; // index of the active step
  onStepClick?: (index: number) => void;
  /** When true, the active step bar uses the purple gradient instead of khaki. */
  activeGradient?: boolean;
  /** Uses the tighter label and spacing treatment from the AI review canvas. */
  compact?: boolean;
}

export function CampaignStepper({
  steps,
  current,
  onStepClick,
  activeGradient = false,
  compact = false,
}: CampaignStepperProps) {
  return (
    <div
      className={`flex items-start overflow-x-auto hide-scrollbar ${compact ? "gap-1" : "gap-3"}`}
    >
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
            className={`flex flex-1 flex-col text-left disabled:cursor-not-allowed ${
              compact ? "min-w-0 gap-1.5" : "min-w-[108px] gap-2 md:min-w-20"
            }`}
          >
            <span
              className={`whitespace-nowrap transition-colors ${compact ? "text-[7px] xl:text-[8px]" : "text-[10px] 2xl:text-xs"} ${
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
