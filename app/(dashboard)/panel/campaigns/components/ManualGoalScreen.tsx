"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type {
  CampaignConfiguration,
  CampaignDestination,
  CampaignGoal,
  CampaignOptimizationGoal,
  CampaignPlatform,
} from "@/lib/campaigns";

interface ManualGoalScreenProps {
  goal: CampaignGoal;
  configuration: CampaignConfiguration;
  platforms: CampaignPlatform[];
  confirmed: boolean;
  onChange: (
    goal: CampaignGoal,
    next: Pick<CampaignConfiguration, "destination" | "optimizationGoal">,
  ) => void;
  onConfirmedChange: (confirmed: boolean) => void;
}

type GoalDefinition = {
  value: CampaignGoal;
  label: string;
  description: string;
  options: Array<{
    destination: CampaignDestination;
    optimizationGoal: CampaignOptimizationGoal;
    label: string;
    detail: string;
    metaOnly?: boolean;
  }>;
  metaOnly?: boolean;
};

const GOALS: GoalDefinition[] = [
  {
    value: "AWARENESS",
    label: "Awareness",
    description: "Reach more people or maximize visible impressions.",
    options: [
      { destination: "WEBSITE", optimizationGoal: "REACH", label: "Reach", detail: "Show the campaign to as many different people as possible." },
      { destination: "WEBSITE", optimizationGoal: "IMPRESSIONS", label: "Impressions", detail: "Maximize the total number of times the campaign is shown." },
    ],
  },
  {
    value: "TRAFFIC",
    label: "Traffic",
    description: "Send people to a website or landing page.",
    options: [
      { destination: "WEBSITE", optimizationGoal: "LINK_CLICKS", label: "Link clicks", detail: "Prioritize people likely to click the ad." },
      { destination: "WEBSITE", optimizationGoal: "LANDING_PAGE_VIEWS", label: "Landing-page views", detail: "Prioritize people likely to wait for the page to load." },
    ],
  },
  {
    value: "ENGAGEMENT",
    label: "Engagement",
    description: "Grow reactions, shares, or video attention.",
    options: [
      { destination: "WEBSITE", optimizationGoal: "POST_ENGAGEMENT", label: "Post engagement", detail: "Prioritize reactions, comments, and shares." },
      { destination: "WEBSITE", optimizationGoal: "VIDEO_VIEWS", label: "Video views", detail: "Prioritize people likely to watch the creative." },
    ],
  },
  {
    value: "SALES",
    label: "Sales",
    description: "Optimize for purchases measured by your selected pixel.",
    options: [
      { destination: "WEBSITE", optimizationGoal: "CONVERSIONS", label: "Website conversions", detail: "Use the selected event source to optimize for purchases." },
    ],
  },
  {
    value: "LEADS",
    label: "Lead generation",
    description: "Collect details from potential customers.",
    options: [
      { destination: "WEBSITE", optimizationGoal: "LEAD_GENERATION", label: "Website leads", detail: "Send people to your own lead page." },
      { destination: "INSTANT_FORM", optimizationGoal: "LEAD_GENERATION", label: "Meta instant form", detail: "Collect lead details without leaving Meta.", metaOnly: true },
    ],
  },
  {
    value: "APP_PROMOTION",
    label: "App promotion",
    description: "Drive installs for a registered Meta app.",
    metaOnly: true,
    options: [
      { destination: "WEBSITE", optimizationGoal: "APP_INSTALLS", label: "App installs", detail: "Prioritize people likely to install the app.", metaOnly: true },
      { destination: "WEBSITE", optimizationGoal: "APP_EVENTS", label: "In-app actions", detail: "Prioritize people likely to complete an in-app event.", metaOnly: true },
    ],
  },
];

export function ManualGoalScreen({
  goal,
  configuration,
  platforms,
  confirmed,
  onChange,
  onConfirmedChange,
}: ManualGoalScreenProps) {
  const [stage, setStage] = useState<"goal" | "optimization">(
    confirmed ? "optimization" : "goal",
  );
  const metaOnlyCampaign = platforms.length === 1 && platforms[0] === "meta";
  const availableGoals = useMemo(
    () => GOALS.filter((item) => !item.metaOnly || metaOnlyCampaign),
    [metaOnlyCampaign],
  );
  const selectedGoal =
    availableGoals.find((item) => item.value === goal) ?? availableGoals[0];
  const options = selectedGoal.options.filter(
    (option) => !option.metaOnly || metaOnlyCampaign,
  );

  const chooseGoal = (definition: GoalDefinition) => {
    const firstOption = definition.options.find(
      (option) => !option.metaOnly || metaOnlyCampaign,
    );
    if (!firstOption) return;
    onChange(definition.value, firstOption);
    onConfirmedChange(false);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {stage === "goal"
              ? "What should this campaign achieve?"
              : "How should the platforms optimize delivery?"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {stage === "goal"
              ? "The next choice controls where people go and which result the ad networks pursue."
              : `${selectedGoal.label} · choose the exact delivery result.`}
          </p>
        </div>
        {stage === "optimization" && (
          <button
            type="button"
            onClick={() => setStage("goal")}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Change goal
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {(stage === "goal" ? availableGoals : options).map((item) => {
          const isGoal = "value" in item;
          const selected = isGoal
            ? goal === item.value
            : configuration.destination === item.destination &&
              configuration.optimizationGoal === item.optimizationGoal;
          return (
            <button
              key={isGoal ? item.value : `${item.destination}-${item.optimizationGoal}`}
              type="button"
              onClick={() => {
                if (isGoal) chooseGoal(item);
                else {
                  onChange(goal, item);
                  onConfirmedChange(true);
                }
              }}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-khaki-300 bg-dimYellow/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                  selected ? "border-gray-900" : "border-gray-300"
                }`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  {isGoal ? item.label : item.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                  {isGoal ? item.description : item.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {stage === "goal" && (
        <button
          type="button"
          onClick={() => setStage("optimization")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300"
        >
          Choose optimization <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}

export default ManualGoalScreen;
