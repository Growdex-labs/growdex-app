"use client";

import { Check, Loader2, Plus } from "lucide-react";
import type { CampaignPlatform } from "@/lib/campaigns";
import type { SocialAccountSetupProps } from "@/types/social";

interface ManualPlatformScreenProps {
  accounts: SocialAccountSetupProps | null;
  loading: boolean;
  connecting: CampaignPlatform | null;
  platforms: CampaignPlatform[];
  accountAssetIds: Partial<Record<CampaignPlatform, string>>;
  onChange: (
    platforms: CampaignPlatform[],
    accountAssetIds: Partial<Record<CampaignPlatform, string>>,
  ) => void;
  onConnect: (platform: CampaignPlatform) => void;
}

function SelectionMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        checked ? "border-gray-900" : "border-gray-300"
      }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
    </span>
  );
}

export function ManualPlatformScreen({
  accounts,
  loading,
  connecting,
  platforms,
  accountAssetIds,
  onChange,
  onConnect,
}: ManualPlatformScreenProps) {
  const selectAsset = (platform: CampaignPlatform, assetId: string) => {
    onChange(
      platforms.includes(platform) ? platforms : [...platforms, platform],
      { ...accountAssetIds, [platform]: assetId },
    );
  };

  const removePlatform = (platform: CampaignPlatform) => {
    const nextAssets = { ...accountAssetIds };
    delete nextAssets[platform];
    onChange(
      platforms.filter((item) => item !== platform),
      nextAssets,
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-gray-900">
        Choose the accounts that will run this campaign
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Select one ad account per platform. Forecasting, event sources, and
        publishing will all use these exact accounts.
      </p>

      {loading ? (
        <div className="mt-6 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-gray-200">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {(["meta", "tiktok"] as CampaignPlatform[]).map((platform) => {
            const provider = accounts?.[platform];
            const assets = provider?.assets ?? [];
            const usable = Boolean(provider?.connected && !provider.needsReauth);
            return (
              <div key={platform} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {platform === "meta" ? "Meta" : "TikTok"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {usable ? `${assets.length} available account${assets.length === 1 ? "" : "s"}` : "Not connected"}
                    </p>
                  </div>
                  {platforms.includes(platform) && (
                    <button
                      type="button"
                      onClick={() => removePlatform(platform)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {usable && assets.length ? (
                  <div className="mt-4 space-y-2">
                    {assets.map((asset) => {
                      const id = asset.id;
                      const selected = accountAssetIds[platform] === id;
                      const name =
                        platform === "meta"
                          ? "adAccountName" in asset
                            ? asset.adAccountName
                            : "Meta account"
                          : "name" in asset
                            ? asset.name
                            : "TikTok account";
                      const providerId =
                        platform === "meta"
                          ? "adAccountId" in asset
                            ? asset.adAccountId
                            : ""
                          : "advertiserId" in asset
                            ? asset.advertiserId
                            : "";
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectAsset(platform, id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                            selected
                              ? "border-khaki-300 bg-dimYellow/30"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <SelectionMark checked={selected} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-900">
                              {name}
                            </span>
                            <span className="block truncate text-[11px] text-gray-400">
                              ID: {providerId}
                            </span>
                          </span>
                          {asset.isPrimary && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
                              <Check className="h-3 w-3" /> Primary
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConnect(platform)}
                    disabled={connecting !== null}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
                  >
                    {connecting === platform ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {connecting === platform
                      ? "Connecting…"
                      : `Connect ${platform === "meta" ? "Meta" : "TikTok"}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ManualPlatformScreen;
