"use client";

import type {
  CampaignConfiguration,
  CampaignDestination,
  CampaignGoal,
  CampaignOptimizationGoal,
  CampaignPlatform,
  MetaSpecialAdCategory,
} from "@/lib/campaigns";

interface ManualGoalScreenProps {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  specialAdCategories: MetaSpecialAdCategory[];
  onChange: (
    goal: CampaignGoal,
    next: Pick<CampaignConfiguration, "destination" | "optimizationGoal">,
  ) => void;
  onSpecialAdCategoriesChange: (categories: MetaSpecialAdCategory[]) => void;
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
    description: "Send people to a website or landing page.",
    destination: "WEBSITE",
    optimizationGoal: "LINK_CLICKS",
  },
  {
    value: "ENGAGEMENT",
    label: "Engagement",
    description: "Grow reactions, comments, shares, and saves on your ad.",
    destination: "WEBSITE",
    optimizationGoal: "POST_ENGAGEMENT",
  },
  {
    value: "SALES",
    label: "Sales",
    description: "Drive purchases measured by your website events.",
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
];

const SPECIAL_CATEGORY_OPTIONS: Array<{
  value: MetaSpecialAdCategory | "";
  label: string;
}> = [
  { value: "", label: "Not a special ad category" },
  { value: "HOUSING", label: "Housing or property" },
  { value: "EMPLOYMENT", label: "Employment or job opportunities" },
  { value: "CREDIT", label: "Credit" },
  {
    value: "FINANCIAL_PRODUCTS_SERVICES",
    label: "Financial products or services",
  },
  {
    value: "ISSUES_ELECTIONS_POLITICS",
    label: "Social issues, elections, or politics",
  },
  {
    value: "ONLINE_GAMBLING_AND_GAMING",
    label: "Online gambling or gaming",
  },
];

export function ManualGoalScreen({
  goal,
  platforms,
  specialAdCategories,
  onChange,
  onSpecialAdCategoriesChange,
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

      {platforms.includes("meta") && (
        <div className="mt-7 border-t border-gray-100 pt-6">
          <label
            htmlFor="meta-special-ad-category"
            className="block text-sm font-gilroy-semibold text-gray-900"
          >
            Does this campaign belong to a Meta special ad category?
          </label>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Meta requires this declaration for regulated topics. Restricted
            categories automatically use broad age, gender, and interest
            targeting.
          </p>
          <select
            id="meta-special-ad-category"
            value={specialAdCategories[0] ?? ""}
            onChange={(event) => {
              const value = event.target.value as MetaSpecialAdCategory | "";
              onSpecialAdCategoriesChange(value ? [value] : []);
            }}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
          >
            {SPECIAL_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}

export default ManualGoalScreen;
