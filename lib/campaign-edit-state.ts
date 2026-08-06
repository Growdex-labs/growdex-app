import {
  validateCampaignCreativeSetup,
  type CreateCampaignPayload,
} from "./campaigns";

export const getCampaignRepairStep = (
  campaign: CreateCampaignPayload,
): number => {
  if (!campaign.campaign.name.trim()) return 0;

  if (
    !campaign.campaign.platforms.length ||
    campaign.campaign.platforms.some(
      (platform) =>
        !campaign.campaign.configuration.accountAssetIds?.[platform],
    )
  ) {
    return 1;
  }

  const incompleteStrategy = campaign.audienceStrategies.find((strategy) =>
    !strategy.name.trim() ||
    (strategy.configuration.optimizationGoal === "CONVERSIONS" &&
      campaign.campaign.platforms.some(
        (platform) => !strategy.configuration.eventSourceIds?.[platform],
      )),
  );
  if (incompleteStrategy) return 3;

  if (
    campaign.audienceStrategies.some(
      (strategy) => !strategy.audience.locations.length,
    )
  ) {
    return 4;
  }

  if (
    campaign.audienceStrategies.some((strategy) => {
      const start = new Date(strategy.budget.startDate);
      const end = strategy.budget.endDate
        ? new Date(strategy.budget.endDate)
        : null;
      return (
        !Number.isFinite(strategy.budget.amount) ||
        strategy.budget.amount <= 0 ||
        Number.isNaN(start.getTime()) ||
        Boolean(end && (Number.isNaN(end.getTime()) || end <= start))
      );
    })
  ) {
    return 5;
  }

  return validateCampaignCreativeSetup(campaign) ? 6 : 7;
};
