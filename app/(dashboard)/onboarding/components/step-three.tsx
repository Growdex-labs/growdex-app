import { ChangeEvent } from "react";
import { FormDataProps } from "../page";
import { StepHeading, PrimaryButton, SkipLink } from "./onboarding-layout";

interface StepGoalsProps {
  formData: FormDataProps;
  toggleGoal: (goal: string) => void;
  change: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onNext: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const GOALS = [
  { id: "leads", icon: "🎯", title: "Generate Leads", description: "Generate prospects and inquiries" },
  { id: "sales", icon: "💰", title: "Generate Sales", description: "Drive purchases and revenue" },
  { id: "traffic", icon: "🚀", title: "Drive Traffic", description: "Send people to your website" },
  { id: "awareness", icon: "📣", title: "Build Awareness", description: "Increase reach and visibility" },
];

export function StepThreeOnboarding({ formData, toggleGoal, change, onNext, onSkip, isLoading }: StepGoalsProps) {
  return (
    <div>
      <StepHeading
        title="Set your marketing goals"
        subtitle="We'll use your goals to recommend the right campaign strategies and optimization opportunities."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GOALS.map((goal) => {
          const selected = formData.goals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                selected
                  ? "border-khaki-300 bg-dimYellow"
                  : "border-[#c8cbd7] bg-[#f9faff] hover:border-khaki-300"
              }`}
            >
              <span className="text-xl leading-none">{goal.icon}</span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-[#333]">{goal.title}</span>
                <span className="mt-0.5 text-xs text-[#666]">{goal.description}</span>
              </span>
              {selected && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-md bg-khaki-300 text-[#333]">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-xs text-[#666]">Don&apos;t see your goal?</p>
        <p className="mb-2 text-sm font-medium text-khaki-300">Tell Growdex what you want to achieve</p>
        <textarea
          name="customGoal"
          value={formData.customGoal}
          onChange={change}
          rows={3}
          placeholder="I want more leads for my real estate company in Lagos."
          className="w-full resize-none rounded-xl border border-[#c8cbd7] bg-[#f9faff] px-4 py-3 text-sm text-[#4d4d4d] outline-none placeholder:text-[#c8cbd7] focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/40"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <PrimaryButton onClick={onNext} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Next'}
        </PrimaryButton>
        <SkipLink onClick={onSkip} disabled={isLoading}>
          I&apos;ll finish this later
        </SkipLink>
      </div>
    </div>
  );
}
