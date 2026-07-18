"use client";

import type {
  CampaignConfiguration,
  CampaignDestination,
  CampaignGoal,
  CampaignOptimizationGoal,
  CampaignPlatform,
} from "@/lib/campaigns";

interface ManualGoalScreenProps {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
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
  destination: CampaignDestination;
  optimizationGoal: CampaignOptimizationGoal;
  metaOnly?: boolean;
};

const GOALS: GoalDefinition[] = [
  {
    value: "AWARENESS",
    label: "Awareness",
    description: "Reach more people and make your brand easier to remember.",
    destination: "WEBSITE",
    optimizationGoal: "REACH",
  },
  {
    value: "TRAFFIC",
    label: "Traffic",
    description: "Send people to a website, app, profile, or conversation.",
    destination: "WEBSITE",
    optimizationGoal: "LINK_CLICKS",
  },
  {
    value: "ENGAGEMENT",
    label: "Engagement",
    description: "Grow reactions, messages, followers, or video attention.",
    destination: "WEBSITE",
    optimizationGoal: "POST_ENGAGEMENT",
  },
  {
    value: "SALES",
    label: "Sales",
    description: "Drive purchases measured by your website or app events.",
    destination: "WEBSITE",
    optimizationGoal: "CONVERSIONS",
  },
  {
    value: "LEADS",
    label: "Lead generation",
    description: "Collect details from potential customers across Meta or your website.",
    destination: "WEBSITE",
    optimizationGoal: "LEAD_GENERATION",
  },
  {
    value: "APP_PROMOTION",
    label: "App promotion",
    description: "Drive installs or actions for a registered Meta app.",
    destination: "APP",
    optimizationGoal: "APP_INSTALLS",
    metaOnly: true,
  },
];

export function ManualGoalScreen({
  goal,
  platforms,
  onChange,
  onConfirmedChange,
}: ManualGoalScreenProps) {
  const metaOnlyCampaign = platforms.length === 1 && platforms[0] === "meta";
  const availableGoals = GOALS.filter(
    (definition) => !definition.metaOnly || metaOnlyCampaign,
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-gilroy-semibold text-gray-900">
        What outcome do you want from this campaign?
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Choose one objective. The next stage will show every destination and
        delivery result available for it.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {availableGoals.map((definition) => {
          const selected = goal === definition.value;
          return (
            <button
              key={definition.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                onChange(definition.value, {
                  destination: definition.destination,
                  optimizationGoal: definition.optimizationGoal,
                });
                onConfirmedChange(true);
              }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-khaki-300 bg-dimYellow/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? "border-gray-900" : "border-gray-300"
                }`}
              >
                {selected && (
                  <span className="size-2.5 rounded-full bg-gray-900" />
                )}
              </span>
              <span>
                <span className="block text-sm font-gilroy-semibold text-gray-900">
                  {definition.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                  {definition.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ManualGoalScreen;
