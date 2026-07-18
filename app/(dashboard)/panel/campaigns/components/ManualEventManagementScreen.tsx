"use client";

import {
  FileText,
  Globe2,
  MessageCircle,
  Smartphone,
  UserRound,
  Video,
} from "lucide-react";
import type {
  CampaignConfiguration,
  CampaignDestination,
  CampaignGoal,
  CampaignOptimizationGoal,
  CampaignPlatform,
} from "@/lib/campaigns";

type DestinationDefinition = {
  value: CampaignDestination;
  label: string;
  description: string;
  icon: typeof Globe2;
  optimizationGoals: Array<{
    value: CampaignOptimizationGoal;
    label: string;
    description: string;
  }>;
  metaOnly?: boolean;
};

const DESTINATIONS: Record<CampaignGoal, DestinationDefinition[]> = {
  AWARENESS: [
    {
      value: "WEBSITE",
      label: "Website",
      description: "Build awareness while sending people to your site.",
      icon: Globe2,
      optimizationGoals: [
        { value: "REACH", label: "Reach", description: "Show the campaign to as many different people as possible." },
        { value: "IMPRESSIONS", label: "Impressions", description: "Maximize the total number of times the campaign is shown." },
      ],
    },
    {
      value: "PROFILE",
      label: "Social profile",
      description: "Grow awareness around your Meta profile.",
      icon: UserRound,
      metaOnly: true,
      optimizationGoals: [
        { value: "FOLLOWERS", label: "Followers", description: "Prioritize people likely to follow your profile." },
        { value: "REACH", label: "Reach", description: "Reach more people who match the audience." },
      ],
    },
    {
      value: "VIDEO",
      label: "Video",
      description: "Build awareness through video viewing.",
      icon: Video,
      optimizationGoals: [
        { value: "VIDEO_VIEWS", label: "Video views", description: "Prioritize people likely to watch the creative." },
        { value: "IMPRESSIONS", label: "Impressions", description: "Maximize the number of video impressions." },
      ],
    },
  ],
  TRAFFIC: [
    {
      value: "WEBSITE",
      label: "Website",
      description: "Send people to a website or landing page.",
      icon: Globe2,
      optimizationGoals: [
        { value: "LINK_CLICKS", label: "Link clicks", description: "Prioritize people likely to click the ad." },
        { value: "LANDING_PAGE_VIEWS", label: "Landing-page views", description: "Prioritize people likely to wait for the page to load." },
      ],
    },
    {
      value: "APP",
      label: "App",
      description: "Send people directly into your mobile app.",
      icon: Smartphone,
      optimizationGoals: [
        { value: "LINK_CLICKS", label: "Link clicks", description: "Drive taps on your app link." },
        { value: "APP_EVENTS", label: "App events", description: "Prioritize people likely to act inside the app." },
      ],
    },
    {
      value: "WHATSAPP",
      label: "WhatsApp",
      description: "Start WhatsApp conversations from the ad.",
      icon: MessageCircle,
      metaOnly: true,
      optimizationGoals: [
        { value: "MESSAGES", label: "Messages", description: "Prioritize people likely to start a conversation." },
      ],
    },
    {
      value: "MESSENGER",
      label: "Messenger",
      description: "Start Messenger conversations from the ad.",
      icon: MessageCircle,
      metaOnly: true,
      optimizationGoals: [
        { value: "MESSAGES", label: "Messages", description: "Prioritize people likely to start a conversation." },
      ],
    },
  ],
  ENGAGEMENT: [
    {
      value: "WEBSITE",
      label: "On your ad",
      description: "Grow reactions, comments, shares, and saves.",
      icon: Globe2,
      optimizationGoals: [
        { value: "POST_ENGAGEMENT", label: "Post engagement", description: "Prioritize reactions, comments, shares, and saves." },
        { value: "VIDEO_VIEWS", label: "Video views", description: "Prioritize people likely to watch the creative." },
      ],
    },
    {
      value: "WHATSAPP",
      label: "WhatsApp",
      description: "Turn engagement into WhatsApp conversations.",
      icon: MessageCircle,
      metaOnly: true,
      optimizationGoals: [
        { value: "MESSAGES", label: "Messages", description: "Prioritize people likely to start a conversation." },
      ],
    },
    {
      value: "PROFILE",
      label: "Social profile",
      description: "Grow profile visits and followers.",
      icon: UserRound,
      metaOnly: true,
      optimizationGoals: [
        { value: "FOLLOWERS", label: "Followers", description: "Prioritize people likely to follow your profile." },
        { value: "POST_ENGAGEMENT", label: "Profile engagement", description: "Prioritize people likely to engage with your content." },
      ],
    },
  ],
  SALES: [
    {
      value: "WEBSITE",
      label: "Website",
      description: "Drive purchases measured by your website pixel.",
      icon: Globe2,
      optimizationGoals: [
        { value: "CONVERSIONS", label: "Conversions", description: "Optimize toward purchases or another selected website event." },
        { value: "LANDING_PAGE_VIEWS", label: "Landing-page views", description: "Drive qualified visits before conversion data is available." },
      ],
    },
    {
      value: "APP",
      label: "App",
      description: "Drive purchases or other high-value app events.",
      icon: Smartphone,
      optimizationGoals: [
        { value: "APP_EVENTS", label: "App events", description: "Optimize toward a selected app event." },
        { value: "APP_INSTALLS", label: "App installs", description: "Grow the audience available for later app sales." },
      ],
    },
  ],
  LEADS: [
    {
      value: "WEBSITE",
      label: "Website",
      description: "Send people to your own lead page.",
      icon: Globe2,
      optimizationGoals: [
        { value: "LEAD_GENERATION", label: "Website leads", description: "Prioritize people likely to complete your lead form." },
        { value: "CONVERSIONS", label: "Conversions", description: "Optimize toward the lead event from your website pixel." },
      ],
    },
    {
      value: "INSTANT_FORM",
      label: "Instant form",
      description: "Collect lead details without leaving Meta.",
      icon: FileText,
      metaOnly: true,
      optimizationGoals: [
        { value: "LEAD_GENERATION", label: "Instant-form leads", description: "Prioritize people likely to complete the form." },
      ],
    },
    {
      value: "WHATSAPP",
      label: "WhatsApp",
      description: "Collect and qualify leads in WhatsApp.",
      icon: MessageCircle,
      metaOnly: true,
      optimizationGoals: [
        { value: "MESSAGES", label: "Messages", description: "Prioritize people likely to start a conversation." },
      ],
    },
    {
      value: "MESSENGER",
      label: "Messenger",
      description: "Collect and qualify leads in Messenger.",
      icon: MessageCircle,
      metaOnly: true,
      optimizationGoals: [
        { value: "MESSAGES", label: "Messages", description: "Prioritize people likely to start a conversation." },
      ],
    },
  ],
  APP_PROMOTION: [
    {
      value: "APP",
      label: "App",
      description: "Send people to your registered mobile app.",
      icon: Smartphone,
      metaOnly: true,
      optimizationGoals: [
        { value: "APP_INSTALLS", label: "App installs", description: "Prioritize people likely to install the app." },
        { value: "APP_EVENTS", label: "App events", description: "Prioritize people likely to complete an in-app action." },
      ],
    },
  ],
};

export function ManualEventManagementScreen({
  goal,
  platforms,
  configuration,
  onChange,
}: {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  configuration: CampaignConfiguration;
  onChange: (next: Partial<CampaignConfiguration>) => void;
}) {
  const metaOnlyCampaign = platforms.length === 1 && platforms[0] === "meta";
  const destinations = DESTINATIONS[goal].filter(
    (destination) => !destination.metaOnly || metaOnlyCampaign,
  );
  const selectedDestination =
    destinations.find(
      (destination) => destination.value === configuration.destination,
    ) ?? destinations[0];
  const selectedOptimization =
    selectedDestination.optimizationGoals.find(
      (optimization) =>
        optimization.value === configuration.optimizationGoal,
    ) ?? selectedDestination.optimizationGoals[0];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-gilroy-semibold text-gray-900">
        Where should people go after they see your ad?
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Destination and delivery are kept separate so every campaign objective
        can use the right event setup.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((destination) => {
          const Icon = destination.icon;
          const selected = destination.value === selectedDestination.value;
          return (
            <button
              key={destination.value}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                onChange({
                  destination: destination.value,
                  optimizationGoal: destination.optimizationGoals[0].value,
                })
              }
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-khaki-300 bg-dimYellow/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
                <Icon className="size-5" />
              </span>
              <span className="mt-3 block text-sm font-gilroy-semibold text-gray-900">
                {destination.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                {destination.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-base font-gilroy-semibold text-gray-900">
          What result should the platforms optimize for?
        </h3>
        <div className="mt-4 space-y-3">
          {selectedDestination.optimizationGoals.map((optimization) => {
            const selected = optimization.value === selectedOptimization.value;
            return (
              <button
                key={optimization.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({ optimizationGoal: optimization.value })
                }
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-khaki-300 bg-dimYellow/20"
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
                    {optimization.label}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {optimization.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ManualEventManagementScreen;
