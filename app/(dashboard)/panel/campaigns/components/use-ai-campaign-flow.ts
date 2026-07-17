"use client";

import { useMemo, useState } from "react";
import type { CreateCampaignPayload } from "@/lib/campaigns";

export type AiStepId =
  | "setup"
  | "goals"
  | "platform"
  | "audience"
  | "budget"
  | "creative";
export type AiStepStatus = "review" | "approved" | "revising";

export interface AiStep {
  id: AiStepId;
  title: string;
  label: string;
  reason: string;
  status: AiStepStatus;
  result: string;
  detail?: string;
  chips?: string[];
  editStep: number;
}

type StepRationales = {
  setup: string;
  goal: string;
  platforms: string;
  audience: string;
  budget: string;
  creative: string;
};

const DEFAULT_STATUSES: Record<AiStepId, AiStepStatus> = {
  setup: "review",
  goals: "review",
  platform: "review",
  audience: "review",
  budget: "review",
  creative: "review",
};

const currencySymbol = (currency: "NGN" | "USD") =>
  currency === "NGN" ? "₦" : "$";

export function useAiCampaignFlow(
  campaign: CreateCampaignPayload,
  rationales: StepRationales,
) {
  const [statuses, setStatuses] =
    useState<Record<AiStepId, AiStepStatus>>(DEFAULT_STATUSES);

  const steps = useMemo<AiStep[]>(
    () => [
      {
        id: "setup",
        title: "Setup campaign",
        label: "Campaign structure",
        reason: rationales.setup,
        status: statuses.setup,
        result: campaign.campaign.name || "Untitled campaign",
        detail: "The name and editable campaign structure created from your request.",
        editStep: 0,
      },
      {
        id: "goals",
        title: "Set campaign goals",
        label: "Goal and delivery optimization",
        reason: rationales.goal,
        status: statuses.goals,
        result: `${campaign.campaign.goal.replaceAll("_", " ")} · ${campaign.campaign.configuration.optimizationGoal.replaceAll("_", " ")}`,
        detail: `Destination: ${campaign.campaign.configuration.destination.replaceAll("_", " ")}`,
        editStep: 2,
      },
      {
        id: "platform",
        title: "Choose platform",
        label: "Advertising platforms",
        reason: rationales.platforms,
        status: statuses.platform,
        result: campaign.campaign.platforms
          .map((platform) => (platform === "meta" ? "Meta" : "TikTok"))
          .join(" and "),
        detail: "The full editor will confirm the exact connected ad account for each platform.",
        editStep: 1,
      },
      {
        id: "audience",
        title: "Target audience",
        label: "Audience recommendation",
        reason: rationales.audience,
        status: statuses.audience,
        result: `${campaign.audience.locations.join(", ")} · ages ${campaign.audience.ageMin ?? 18}–${campaign.audience.ageMax ?? 65}`,
        detail: `${campaign.audience.interests?.length ?? 0} interests · ${campaign.audience.languages?.length ? campaign.audience.languages.join(", ") : "all languages"}`,
        chips: [
          campaign.audience.gender ?? "all",
          ...(campaign.audience.devices ?? ["mobile"]),
        ],
        editStep: 3,
      },
      {
        id: "budget",
        title: "Budget and schedule",
        label: "Budget recommendation",
        reason: rationales.budget,
        status: statuses.budget,
        result: `${currencySymbol(campaign.budget.currency)}${campaign.budget.amount.toLocaleString()} ${campaign.budget.type}`,
        detail: `${new Date(campaign.budget.startDate).toLocaleString()}${campaign.budget.endDate ? ` – ${new Date(campaign.budget.endDate).toLocaleString()}` : ""}`,
        editStep: 4,
      },
      {
        id: "creative",
        title: "Creative setup",
        label: "Creative draft",
        reason: rationales.creative,
        status: statuses.creative,
        result: `${campaign.adContent.creatives.length} editable creative${campaign.adContent.creatives.length === 1 ? "" : "s"}`,
        detail:
          campaign.adContent.creatives[0]?.primaryText ||
          "Creative copy is ready for review.",
        editStep: 5,
      },
    ],
    [campaign, rationales, statuses],
  );

  const approve = (id: AiStepId) =>
    setStatuses((current) => ({ ...current, [id]: "approved" }));
  const approveAll = () =>
    setStatuses(
      Object.fromEntries(
        Object.keys(DEFAULT_STATUSES).map((id) => [id, "approved"]),
      ) as Record<AiStepId, AiStepStatus>,
    );
  const markRevising = (id: AiStepId) =>
    setStatuses((current) => ({ ...current, [id]: "revising" }));
  const markReview = (id: AiStepId) =>
    setStatuses((current) => ({ ...current, [id]: "review" }));
  const resetReviews = () => setStatuses(DEFAULT_STATUSES);
  const allApproved = Object.values(statuses).every(
    (status) => status === "approved",
  );

  return {
    steps,
    approve,
    approveAll,
    markRevising,
    markReview,
    resetReviews,
    allApproved,
  };
}
