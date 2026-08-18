import type { CreativeAsset } from "@/lib/assets";
import type {
  CampaignCreativeInput,
  CampaignPlatform,
} from "@/lib/campaigns";

export const MAX_SELECTED_ASSETS = 6;

const emptyFromAsset = (
  asset: CreativeAsset,
  platform: CampaignPlatform,
  source?: CampaignCreativeInput,
): CampaignCreativeInput => ({
  platform,
  primaryText: source?.primaryText ?? "",
  headline: source?.headline ?? asset.name,
  cta: source?.cta ?? "LEARN_MORE",
  mediaUrl: asset.url,
  mediaType: asset.mediaType,
  thumbnailUrl: asset.thumbnailUrl,
  landingPageUrl: source?.landingPageUrl,
  appId: source?.appId,
  leadFormId: source?.leadFormId,
});

export function mergeSelectedAssets(
  assets: CreativeAsset[],
  creatives: CampaignCreativeInput[],
  platforms: CampaignPlatform[],
): CampaignCreativeInput[] {
  const selectedAssets = assets.slice(0, MAX_SELECTED_ASSETS);
  const next = selectedAssets.map((asset, index) => {
    const platform = platforms[index % platforms.length];
    return emptyFromAsset(
      asset,
      platform,
      creatives.find((creative) => creative.platform === platform),
    );
  });

  for (const platform of platforms) {
    if (!next.some((creative) => creative.platform === platform)) {
      const asset = selectedAssets[0];
      if (asset && next.length < MAX_SELECTED_ASSETS) {
        next.push(
          emptyFromAsset(
            asset,
            platform,
            creatives.find((creative) => creative.platform === platform),
          ),
        );
      } else {
        const current = creatives.find((creative) => creative.platform === platform);
        if (current) next.push(current);
      }
    }
  }

  return next.slice(0, MAX_SELECTED_ASSETS);
}
