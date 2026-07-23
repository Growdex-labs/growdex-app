import { apiFetch } from "@/lib/auth";
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
  kind: "asset" | "post";
  network?: "facebook" | "instagram";
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
        kind: "asset",
      });
    }
  }

  return [...unique.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
};

export const fetchMetaSocialPosts = async (
  assetId: string,
): Promise<CreativeAsset[]> => {
  const response = await apiFetch(
    `/campaigns/social-posts?assetId=${encodeURIComponent(assetId)}`,
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `Could not load Meta posts (${response.status}).`,
    );
  }
  if (!Array.isArray(body.posts)) {
    throw new Error("Meta posts returned an invalid response.");
  }

  return (body.posts as unknown[])
    .filter(
      (post: unknown): post is Record<string, unknown> =>
        Boolean(
          post &&
            typeof post === "object" &&
            typeof (post as Record<string, unknown>).id === "string" &&
            typeof (post as Record<string, unknown>).mediaUrl === "string",
        ),
    )
    .map((post) => ({
      id: String(post.id),
      name:
        typeof post.name === "string" && post.name.trim()
          ? post.name
          : "Meta post",
      url: String(post.mediaUrl),
      platform: "meta" as const,
      campaignId: "",
      campaignName:
        post.network === "instagram" ? "Instagram post" : "Facebook post",
      status: "published",
      createdAt: typeof post.createdAt === "string" ? post.createdAt : "",
      kind: "post" as const,
      network:
        post.network === "instagram"
          ? ("instagram" as const)
          : ("facebook" as const),
    }));
};
