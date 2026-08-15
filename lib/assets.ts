import { apiFetch } from "@/lib/auth";
import { fetchCampaigns, type CampaignPlatform } from "@/lib/campaigns";
import { isVideoMedia } from "@/lib/campaign-shared";
import type { UploadedCreative } from "@/lib/media-upload";

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
  network?: "facebook" | "instagram" | "tiktok";
  mediaType?: "image" | "video";
  thumbnailUrl?: string;
}

const fingerprint = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
};

export const PUBLISHED_CAMPAIGN_STATUSES = new Set([
  "publishing",
  "under_review",
  "active",
  "paused",
  "completed",
]);

export const LIBRARY_UPLOAD_LABEL = "Uploaded";
export const LIBRARY_UPLOADS_STORAGE_KEY = "growdex_library_uploads";

const isLibraryAsset = (value: unknown): value is CreativeAsset => {
  if (!value || typeof value !== "object") return false;
  const asset = value as Record<string, unknown>;
  return (
    typeof asset.id === "string" &&
    typeof asset.name === "string" &&
    typeof asset.url === "string" &&
    (asset.platform === "meta" || asset.platform === "tiktok") &&
    typeof asset.campaignId === "string" &&
    typeof asset.campaignName === "string" &&
    typeof asset.status === "string" &&
    typeof asset.createdAt === "string" &&
    asset.kind === "asset"
  );
};

export const readLibraryUploads = (): CreativeAsset[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIBRARY_UPLOADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLibraryAsset) : [];
  } catch {
    return [];
  }
};

export const libraryAssetFromUpload = (
  uploaded: UploadedCreative,
): CreativeAsset => {
  const platform = uploaded.mediaType === "video" ? "tiktok" : "meta";
  return {
    id: `library:${fingerprint(uploaded.url)}`,
    name: uploaded.name.slice(0, 80),
    url: uploaded.url,
    platform,
    campaignId: "",
    campaignName: LIBRARY_UPLOAD_LABEL,
    status: "available",
    createdAt: new Date().toISOString(),
    kind: "asset",
    mediaType: uploaded.mediaType,
    thumbnailUrl: uploaded.thumbnailUrl,
  };
};

export const persistLibraryUpload = (uploaded: UploadedCreative): CreativeAsset => {
  const asset = libraryAssetFromUpload(uploaded);
  const next = [
    asset,
    ...readLibraryUploads().filter((item) => item.url !== asset.url),
  ];
  window.localStorage.setItem(LIBRARY_UPLOADS_STORAGE_KEY, JSON.stringify(next));
  return asset;
};

export const fetchCreativeAssets = async (options?: {
  platforms?: CampaignPlatform[];
}): Promise<CreativeAsset[]> => {
  const campaigns = await fetchCampaigns();
  const requestedPlatforms = options?.platforms
    ? new Set(options.platforms)
    : null;
  const unique = new Map<string, CreativeAsset>();

  for (const asset of readLibraryUploads()) {
    // An uploaded image can serve either platform. Keep the stored record
    // backwards-compatible while presenting it with the requested platform.
    const assetPlatforms =
      asset.mediaType === "image"
        ? requestedPlatforms
          ? [...requestedPlatforms]
          : [asset.platform]
        : [asset.platform];

    for (const platform of assetPlatforms) {
      if (requestedPlatforms && !requestedPlatforms.has(platform)) continue;
      const compatibleAsset =
        platform === asset.platform
          ? asset
          : { ...asset, id: `${asset.id}:${platform}`, platform };
      unique.set(`${platform}:${asset.url}`, compatibleAsset);
    }
  }

  for (const campaign of campaigns) {
    for (const creative of campaign.creatives ?? []) {
      if (!creative.mediaUrl || !creative.platform) continue;
      if (requestedPlatforms && !requestedPlatforms.has(creative.platform)) {
        continue;
      }

      const identity = `${creative.platform}:${creative.mediaUrl}`;
      if (unique.has(identity)) continue;
      unique.set(identity, {
        id: `${creative.platform}:${fingerprint(creative.mediaUrl)}`,
        name: (creative.headline?.trim() || campaign.name).slice(0, 80),
        url: creative.mediaUrl,
        platform: creative.platform,
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: campaign.status ?? "draft",
        createdAt: creative.createdAt ?? campaign.createdAt ?? "",
      kind: "asset",
      mediaType: isVideoMedia({
        url: creative.mediaUrl,
        platform: creative.platform,
        mediaType: creative.mediaType,
      })
        ? "video"
        : "image",
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
      mediaType:
        typeof post.mediaType === "string" &&
        post.mediaType.toLowerCase() === "video"
          ? ("video" as const)
          : ("image" as const),
      thumbnailUrl:
        typeof post.thumbnailUrl === "string" ? post.thumbnailUrl : undefined,
      network:
        post.network === "instagram"
          ? ("instagram" as const)
          : ("facebook" as const),
    }));
};

export const fetchTikTokCreativeAssets = async (
  assetId: string,
): Promise<CreativeAsset[]> => {
  const response = await apiFetch(
    `/campaigns/tiktok-creative-assets?assetId=${encodeURIComponent(assetId)}`,
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `Could not load TikTok assets (${response.status}).`,
    );
  }
  if (!Array.isArray(body.assets)) {
    throw new Error("TikTok assets returned an invalid response.");
  }

  return (body.assets as unknown[])
    .filter(
      (asset: unknown): asset is Record<string, unknown> =>
        Boolean(
          asset &&
            typeof asset === "object" &&
            typeof (asset as Record<string, unknown>).id === "string" &&
            typeof (asset as Record<string, unknown>).mediaUrl === "string",
        ),
    )
    .map((asset) => ({
      id: String(asset.id),
      name:
        typeof asset.name === "string" && asset.name.trim()
          ? asset.name
          : "TikTok video",
      url: String(asset.mediaUrl),
      platform: "tiktok" as const,
      campaignId: "",
      campaignName: "TikTok creative library",
      status: "available",
      createdAt: typeof asset.createdAt === "string" ? asset.createdAt : "",
      kind: "asset" as const,
      network: undefined,
      mediaType: "video" as const,
      thumbnailUrl:
        typeof asset.thumbnailUrl === "string"
          ? asset.thumbnailUrl
          : undefined,
    }));
};

export const fetchTikTokSocialPosts = async (
  assetId: string,
): Promise<CreativeAsset[]> => {
  const response = await apiFetch(
    `/campaigns/tiktok-social-posts?assetId=${encodeURIComponent(assetId)}`,
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `Could not load TikTok posts (${response.status}).`,
    );
  }
  if (!Array.isArray(body.posts)) {
    throw new Error("TikTok posts returned an invalid response.");
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
          : "TikTok post",
      url: String(post.mediaUrl),
      platform: "tiktok" as const,
      campaignId: "",
      campaignName: "TikTok post",
      status: "published",
      createdAt: typeof post.createdAt === "string" ? post.createdAt : "",
      kind: "post" as const,
      network: "tiktok" as const,
      mediaType: "video" as const,
      thumbnailUrl:
        typeof post.thumbnailUrl === "string" ? post.thumbnailUrl : undefined,
    }));
};
