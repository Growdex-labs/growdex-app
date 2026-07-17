import { fetchCampaigns, type CampaignPlatform } from "@/lib/campaigns";

export interface CreativeAsset {
  id: string;
  name: string;
  url: string;
  platform: CampaignPlatform;
  campaignId: string;
  campaignName: string;
  status: string;
  createdAt: string;
}

export const PUBLISHED_CAMPAIGN_STATUSES = new Set([
  "publishing",
  "under_review",
  "active",
  "paused",
  "completed",
]);

export const fetchCreativeAssets = async (options?: {
  platforms?: CampaignPlatform[];
}): Promise<CreativeAsset[]> => {
  const campaigns = await fetchCampaigns();
  const requestedPlatforms = options?.platforms
    ? new Set(options.platforms)
    : null;
  const unique = new Map<string, CreativeAsset>();

  for (const campaign of campaigns) {
    for (const creative of campaign.creatives ?? []) {
      if (!creative.mediaUrl || !creative.platform) continue;
      if (requestedPlatforms && !requestedPlatforms.has(creative.platform)) {
        continue;
      }

      const identity = `${creative.platform}:${creative.mediaUrl}`;
      if (unique.has(identity)) continue;
      unique.set(identity, {
        id: identity,
        name: creative.headline?.trim() || campaign.name,
        url: creative.mediaUrl,
        platform: creative.platform,
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: campaign.status ?? "draft",
        createdAt: creative.createdAt ?? campaign.createdAt ?? "",
      });
    }
  }

  return [...unique.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
};

