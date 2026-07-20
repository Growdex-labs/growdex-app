import type { CreativeAsset } from "@/lib/assets";
import type {
  CampaignCreativeInput,
  CampaignPlatform,
} from "@/lib/campaigns";

export const MAX_SELECTED_ASSETS = 6;

const emptyFromAsset = (
  asset: CreativeAsset,
  source?: CampaignCreativeInput,
): CampaignCreativeInput => ({
  platform: asset.platform,
  primaryText: source?.primaryText ?? "",
  headline: source?.headline ?? asset.name,
  cta: source?.cta ?? "LEARN_MORE",
  mediaUrl: asset.url,
  landingPageUrl: source?.landingPageUrl,
  appId: source?.appId,
  leadFormId: source?.leadFormId,
});

export function mergeSelectedAssets(
  assets: CreativeAsset[],
  creatives: CampaignCreativeInput[],
  platforms: CampaignPlatform[],
): CampaignCreativeInput[] {
  const missingPlatforms = platforms.filter(
    (platform) => !assets.some((asset) => asset.platform === platform),
  );
  const selectedLimit = Math.max(
    0,
    MAX_SELECTED_ASSETS - missingPlatforms.length,
  );
  const next = assets.slice(0, selectedLimit).map((asset) =>
    emptyFromAsset(
      asset,
      creatives.find((creative) => creative.platform === asset.platform),
    ),
  );

  for (const platform of platforms) {
    if (!next.some((creative) => creative.platform === platform)) {
      const current = creatives.find((creative) => creative.platform === platform);
      if (current) next.push(current);
    }
  }

  return next.slice(0, MAX_SELECTED_ASSETS);
}
