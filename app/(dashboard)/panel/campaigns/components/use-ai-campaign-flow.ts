"use client";

import { useMemo, useState } from "react";
import {
  AI_CAMPAIGN_STEP_IDS,
  type AiCampaignStepId,
  type CreateCampaignPayload,
} from "@/lib/campaigns";

export type AiStepId = AiCampaignStepId;
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
}

type StepRationales = {
  setup: string;
  goal: string;
  platforms: string;
  event: string;
  audience: string;
  budget: string;
  creative: string;
};

const DEFAULT_STATUSES: Record<AiStepId, AiStepStatus> = {
  setup: "review",
  platform: "review",
  goals: "review",
  event: "review",
  audience: "review",
  budget: "review",
  creative: "review",
};

const currencySymbol = (currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;

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
        detail:
          "The name and editable campaign structure created from your request.",
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
        detail: campaign.campaign.platforms
          .map((platform) => {
            const accountId =
              campaign.campaign.configuration.accountAssetIds?.[platform];
            return `${platform === "meta" ? "Meta" : "TikTok"}: ${accountId || "account selection required"}`;
          })
          .join(" · "),
      },
      {
        id: "goals",
        title: "Set campaign goals",
        label: "Campaign objective",
        reason: rationales.goal,
        status: statuses.goals,
        result: campaign.campaign.goal.replaceAll("_", " "),
        detail: "The business outcome Growdex AI selected from your request.",
      },
      {
        id: "event",
        title: "Event management",
        label: "Destination and delivery result",
        reason: rationales.event,
        status: statuses.event,
        result: `${campaign.campaign.configuration.destination.replaceAll("_", " ")} · ${campaign.campaign.configuration.optimizationGoal.replaceAll("_", " ")}`,
        detail:
          campaign.campaign.configuration.optimizationGoal === "CONVERSIONS"
            ? `${Object.values(campaign.campaign.configuration.eventSourceIds ?? {}).filter(Boolean).length} conversion data source${Object.values(campaign.campaign.configuration.eventSourceIds ?? {}).filter(Boolean).length === 1 ? "" : "s"} selected`
            : "This delivery result does not require a conversion data source.",
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
      },
      {
        id: "budget",
        title: "Budget and schedule",
        label: "Budget recommendation",
        reason: rationales.budget,
        status: statuses.budget,
        result: `${currencySymbol(campaign.budget.currency)}${campaign.budget.amount.toLocaleString()} ${campaign.budget.type}`,
        detail: `${new Date(campaign.budget.startDate).toLocaleString()}${campaign.budget.endDate ? ` – ${new Date(campaign.budget.endDate).toLocaleString()}` : ""}`,
      },
      {
        id: "creative",
        title: "Creative setup",
        label: "Creative draft",
        reason: rationales.creative,
        status: statuses.creative,
        result: `${campaign.adContent.creatives.length} platform-specific creative${campaign.adContent.creatives.length === 1 ? "" : "s"}`,
        detail: campaign.adContent.creatives
          .map(
            (creative) =>
              `${creative.platform === "meta" ? "Meta" : "TikTok"}: ${creative.primaryText || "copy required"}${creative.mediaUrl ? " · media ready" : " · media required"}`,
          )
          .join(" | "),
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
  const applyRevision = (changedSteps: AiStepId[]) =>
    setStatuses((current) => ({
      ...current,
      ...Object.fromEntries(changedSteps.map((id) => [id, "review"])),
    }));
  const resetReviews = () => setStatuses(DEFAULT_STATUSES);
  const restoreStatuses = (next: Record<AiStepId, AiStepStatus>) =>
    setStatuses(next);
  const approvedStepIds = AI_CAMPAIGN_STEP_IDS.filter(
    (id) => statuses[id] === "approved",
  );
  const allApproved = Object.values(statuses).every(
    (status) => status === "approved",
  );

  return {
    steps,
    approve,
    approveAll,
    markRevising,
    markReview,
    applyRevision,
    resetReviews,
    restoreStatuses,
    approvedStepIds,
    statuses,
    allApproved,
  };
}
