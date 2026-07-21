"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Film,
  Grid2X2,
  ImageIcon,
  Library,
  List,
  Loader2,
  Plus,
  Search,
  UploadCloud,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { isVideoUrl } from "@/lib/campaign-shared";
import {
  fetchCreativeAssets,
  PUBLISHED_CAMPAIGN_STATUSES,
  type CreativeAsset,
} from "@/lib/assets";
import {
  fetchMetaLeadForms,
  type CampaignCreativeInput,
  type CampaignCta,
  type CampaignDestination,
  type CampaignGoal,
  type CampaignPlatform,
  type MetaLeadForm,
} from "@/lib/campaigns";
import type { SocialAccountSetupProps } from "@/types/social";
import { CreativeAdEditor } from "./CreativeAdEditor";
import {
  MAX_SELECTED_ASSETS,
  mergeSelectedAssets,
} from "./creative-setup-state";

interface CreativeSetupScreenProps {
  goal: CampaignGoal;
  destination: CampaignDestination;
  metaAssetId?: string;
  platforms: CampaignPlatform[];
  creatives: CampaignCreativeInput[];
  ctaOptions: Array<{ value: CampaignCta; label: string }>;
  uploading: number | null;
  sameCreativeForAll: boolean;
  accounts: SocialAccountSetupProps | null;
  accountsLoading: boolean;
  connecting: CampaignPlatform | null;
  connectionError: string | null;
  onConnect: (platform: CampaignPlatform) => void;
  onSameCreativeForAllChange: (checked: boolean) => void;
  onChange: (index: number, next: Partial<CampaignCreativeInput>) => void;
  onReplace: (creatives: CampaignCreativeInput[]) => void;
  onUpload: (index: number, platform: CampaignPlatform, file: File) => void;
}

const platformName = (platform: CampaignPlatform) =>
  platform === "meta" ? "Meta" : "TikTok";

function PlatformConnectionGate({
  platforms,
  accounts,
  accountsLoading,
  connecting,
  connectionError,
  onConnect,
}: Pick<
  CreativeSetupScreenProps,
  | "platforms"
  | "accounts"
  | "accountsLoading"
  | "connecting"
  | "connectionError"
  | "onConnect"
>) {
  if (accountsLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const disconnected = platforms.filter(
    (platform) =>
      !accounts?.[platform]?.connected || accounts[platform]?.needsReauth,
  );

  if (!disconnected.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 p-6 md:px-8">
        <p className="text-xs font-gilroy-semibold uppercase tracking-[0.14em] text-violet-500">
          Creative setup
        </p>
        <h2 className="mt-2 text-2xl font-gilroy-bold text-gray-950">
          Connect your ad platform to continue
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Growdex needs the connected platform to load your media, forms, and the correct ad preview.
        </p>
      </header>

      <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
        {disconnected.map((platform) => {
          const isConnecting = connecting === platform;
          const Icon = platform === "meta" ? ImageIcon : Film;
          return (
            <article key={platform} className="rounded-2xl border border-gray-200 bg-[#fafafa] p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-dimYellow text-gray-800">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-gilroy-bold text-gray-950">
                {platformName(platform)} is not connected
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Connect {platformName(platform)} before choosing and setting up this platform’s creative.
              </p>
              <button
                type="button"
                onClick={() => onConnect(platform)}
                disabled={connecting !== null}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-gilroy-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {isConnecting ? "Connecting…" : `Connect ${platformName(platform)}`}
              </button>
            </article>
          );
        })}
      </div>

      {connectionError && (
        <p className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 md:mx-8 md:mb-8">
          {connectionError}
        </p>
      )}
    </section>
  );
}

export function CreativeSetupScreen({
  goal,
  destination,
  metaAssetId,
  platforms,
  creatives,
  ctaOptions,
  uploading,
  sameCreativeForAll,
  accounts,
  accountsLoading,
  connecting,
  connectionError,
  onConnect,
  onSameCreativeForAllChange,
  onChange,
  onReplace,
  onUpload,
}: CreativeSetupScreenProps) {
  const [library, setLibrary] = useState<CreativeAsset[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [tab, setTab] = useState<"posts" | "assets">("assets");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | CampaignPlatform>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [screen, setScreen] = useState<"library" | "editor">("library");
  const [activeCreativeIndex, setActiveCreativeIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [leadFormsResult, setLeadFormsResult] = useState<{
    assetId: string;
    forms: MetaLeadForm[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    void fetchCreativeAssets({ platforms })
      .then((assets) => {
        if (!active) return;
        setLibrary(assets);
      })
      .catch((failure) => {
        if (!active) return;
        setLibraryError(
          failure instanceof Error
            ? failure.message
            : "Could not load the creative library.",
        );
      })
      .finally(() => {
        if (active) setLibraryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [platforms]);

  useEffect(() => {
    if (destination !== "INSTANT_FORM" || !metaAssetId) return;

    const controller = new AbortController();
    void fetchMetaLeadForms(metaAssetId, controller.signal)
      .then((response) =>
        setLeadFormsResult({
          assetId: metaAssetId,
          forms: response.forms,
          error: null,
        }),
      )
      .catch((failure) => {
        if (controller.signal.aborted) return;
        setLeadFormsResult({
          assetId: metaAssetId,
          forms: [],
          error:
            failure instanceof Error
              ? failure.message
              : "Could not load Meta Instant Forms.",
        });
      });

    return () => controller.abort();
  }, [destination, metaAssetId]);

  const leadForms =
    metaAssetId && leadFormsResult?.assetId === metaAssetId
      ? leadFormsResult.forms
      : [];
  const leadFormsError =
    metaAssetId && leadFormsResult?.assetId === metaAssetId
      ? leadFormsResult.error
      : null;
  const leadFormsLoading =
    destination === "INSTANT_FORM" &&
    Boolean(metaAssetId) &&
    leadFormsResult?.assetId !== metaAssetId;

  const disconnected = platforms.filter(
    (platform) =>
      !accounts?.[platform]?.connected || accounts[platform]?.needsReauth,
  );

  const visibleAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return library.filter((asset) => {
      if (
        tab === "posts" &&
        !PUBLISHED_CAMPAIGN_STATUSES.has(asset.status.toLowerCase())
      ) {
        return false;
      }
      if (platformFilter !== "all" && asset.platform !== platformFilter) {
        return false;
      }
      return (
        !normalizedQuery ||
        asset.name.toLowerCase().includes(normalizedQuery) ||
        asset.campaignName.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [library, platformFilter, query, tab]);

  const selectedAssets = useMemo(
    () => library.filter((asset) => selected.includes(asset.id)),
    [library, selected],
  );
  const currentMedia = creatives.filter((creative) => creative.mediaUrl);
  const hasChosenMedia = selectedAssets.length > 0 || currentMedia.length > 0;
  const allVisibleSelected =
    visibleAssets.length > 0 &&
    visibleAssets.every((asset) => selected.includes(asset.id));

  const canAddAsset = (current: string[], id: string) => {
    const proposedIds = new Set([...current, id]);
    const proposedAssets = library.filter((asset) => proposedIds.has(asset.id));
    const missingPlatformCount = platforms.filter(
      (platform) =>
        !proposedAssets.some((asset) => asset.platform === platform),
    ).length;
    return (
      proposedAssets.length <= MAX_SELECTED_ASSETS - missingPlatformCount
    );
  };

  const toggleAsset = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (!canAddAsset(current, id)) return current;
      return [...current, id];
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(visibleAssets.map((asset) => asset.id));
      setSelected((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }

    setSelected((current) => {
      const next = [...current];
      for (const asset of visibleAssets) {
        if (next.length >= MAX_SELECTED_ASSETS) break;
        if (!next.includes(asset.id) && canAddAsset(next, asset.id)) {
          next.push(asset.id);
        }
      }
      return next;
    });
  };

  const setupAds = () => {
    const next = selectedAssets.length
      ? mergeSelectedAssets(selectedAssets, creatives, platforms)
      : creatives;
    const firstReadyIndex = next.findIndex((creative) => creative.mediaUrl);
    if (firstReadyIndex < 0) return;
    if (selectedAssets.length) onReplace(next);
    setActiveCreativeIndex(firstReadyIndex);
    setScreen("editor");
  };

  const removeCreative = (index: number) => {
    const creative = creatives[index];
    if (!creative) return;
    const platformCount = creatives.filter(
      (item) => item.platform === creative.platform,
    ).length;
    if (platformCount <= 1) return;
    onReplace(creatives.filter((_, creativeIndex) => creativeIndex !== index));
    setActiveCreativeIndex((current) => Math.max(0, Math.min(current, creatives.length - 2)));
  };

  const handleLibraryUpload = (file: File) => {
    setUploadError(null);
    const platform = file.type.startsWith("image/")
      ? "meta"
      : file.type.startsWith("video/")
        ? "tiktok"
        : null;

    if (!platform) {
      setUploadError("Choose an image for Meta or a video for TikTok.");
      return;
    }
    if (!platforms.includes(platform)) {
      setUploadError(
        platform === "meta"
          ? "This campaign does not include Meta. Upload a TikTok video instead."
          : "This campaign does not include TikTok. Upload a Meta image instead.",
      );
      return;
    }

    const index = creatives.findIndex((creative) => creative.platform === platform);
    if (index < 0) {
      setUploadError(`Add ${platformName(platform)} to the campaign before uploading its creative.`);
      return;
    }
    onUpload(index, platform, file);
  };

  if (accountsLoading || disconnected.length) {
    return (
      <PlatformConnectionGate
        platforms={platforms}
        accounts={accounts}
        accountsLoading={accountsLoading}
        connecting={connecting}
        connectionError={connectionError}
        onConnect={onConnect}
      />
    );
  }

  if (screen === "editor") {
    const resolvedActiveIndex = Math.max(
      0,
      Math.min(activeCreativeIndex, creatives.length - 1),
    );
    return (
      <CreativeAdEditor
        goal={goal}
        destination={destination}
        creatives={creatives}
        ctaOptions={ctaOptions}
        uploading={uploading}
        activeIndex={resolvedActiveIndex}
        leadForms={leadForms}
        leadFormsLoading={leadFormsLoading}
        leadFormsError={leadFormsError}
        onActiveIndexChange={setActiveCreativeIndex}
        onBack={() => setScreen("library")}
        onChange={onChange}
        onRemove={removeCreative}
        onUpload={onUpload}
      />
    );
  }

  const uploadAccept =
    platforms.length > 1
      ? "image/*,video/*"
      : platforms[0] === "meta"
        ? "image/*"
        : "video/*";

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 p-6 md:px-8">
        <p className="text-xs font-gilroy-semibold uppercase tracking-[0.14em] text-violet-500">
          Creative setup
        </p>
        <h2 className="mt-2 text-2xl font-gilroy-bold text-gray-950">
          Choose the media for your ads
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Select up to six saved assets or upload from your computer. Meta uses images and TikTok uses video.
        </p>
      </header>

      {!libraryLoading && !libraryError && library.length === 0 ? (
        <div className="flex min-h-[440px] flex-col items-center justify-center p-6 text-center md:p-10">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-dimYellow text-gray-800">
            <Library className="size-7" />
          </span>
          <h3 className="mt-5 text-xl font-gilroy-bold text-gray-950">
            Your asset library is empty
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            Upload the first creative here. It will stay in this campaign and
            appear in the embedded library for future campaigns.
          </p>
          <div className="mt-6 w-full max-w-md">
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-gilroy-semibold text-white transition-colors hover:bg-gray-800">
              {uploading !== null ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              {uploading !== null ? "Uploading…" : "Upload from computer"}
              <input
                type="file"
                className="hidden"
                accept={uploadAccept}
                disabled={uploading !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleLibraryUpload(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {uploadError && <p className="mt-4 text-sm text-red-600">{uploadError}</p>}

          {currentMedia.length > 0 && (
            <div className="mt-6 w-full max-w-md">
              {platforms.length > 1 && (
                <label className="flex items-start justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-left">
                  <span>
                    <span className="block text-sm font-gilroy-semibold text-violet-950">
                      Use the same creative across platforms
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-violet-700">
                      Copy stays in sync while each platform keeps its required media type.
                    </span>
                  </span>
                  <Switch
                    checked={sameCreativeForAll}
                    onCheckedChange={onSameCreativeForAllChange}
                    className="shrink-0 data-[state=checked]:bg-khaki-300"
                  />
                </label>
              )}
              <button
                type="button"
                onClick={setupAds}
                className="mt-4 inline-flex items-center gap-2 text-sm font-gilroy-semibold text-violet-600"
              >
                Setup uploaded ad <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="border-b border-gray-100 p-5 md:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-56 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search assets or campaigns"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
                />
              </div>
              <div className="flex rounded-xl bg-gray-100 p-1">
                {(["assets", "posts"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm capitalize transition-colors ${
                      tab === item
                        ? "bg-white font-gilroy-semibold text-gray-900 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <select
                value={platformFilter}
                onChange={(event) => setPlatformFilter(event.target.value as "all" | CampaignPlatform)}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600"
              >
                <option value="all">All platforms</option>
                {platforms.includes("meta") && <option value="meta">Meta</option>}
                {platforms.includes("tiktok") && <option value="tiktok">TikTok</option>}
              </select>
              <div className="flex overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={`p-3 ${view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={`p-3 ${view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2 font-gilroy-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="size-4 accent-khaki-300"
                />
                Select all visible
              </label>
              <span className="text-gray-400">
                {selected.length}/{MAX_SELECTED_ASSETS} selected
              </span>
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-xs font-gilroy-semibold text-gray-700 hover:bg-gray-50">
                {uploading !== null ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                {uploading !== null ? "Uploading…" : "Upload from computer"}
                <input
                  type="file"
                  className="hidden"
                  accept={uploadAccept}
                  disabled={uploading !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleLibraryUpload(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
          </div>

          <div className="p-5 md:p-8">
            {libraryLoading ? (
              <div className="flex min-h-80 items-center justify-center">
                <Loader2 className="size-7 animate-spin text-gray-400" />
              </div>
            ) : libraryError ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                {libraryError}
              </div>
            ) : visibleAssets.length ? (
              <div className={view === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
                {visibleAssets.map((asset) => {
                  const isSelected = selected.includes(asset.id);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => toggleAsset(asset.id)}
                      aria-pressed={isSelected}
                      className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected ? "border-khaki-300 shadow-sm" : "border-gray-100"
                      } ${view === "list" ? "flex items-center gap-4 p-3" : ""}`}
                    >
                      <span className={`relative block shrink-0 overflow-hidden bg-gray-100 ${view === "grid" ? "aspect-4/3 w-full" : "h-20 w-28 rounded-xl"}`}>
                        {isVideoUrl(asset.url) ? (
                          <video className="h-full w-full object-cover" src={asset.url} muted />
                        ) : (
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            src={asset.url}
                            alt=""
                            fill
                            sizes={view === "grid" ? "320px" : "112px"}
                            unoptimized
                          />
                        )}
                        <span className={`absolute left-3 top-3 flex size-6 items-center justify-center rounded-md border ${
                          isSelected
                            ? "border-khaki-300 bg-khaki-200 text-gray-900"
                            : "border-white/80 bg-white/90 text-transparent"
                        }`}>
                          <Check className="size-3.5" />
                        </span>
                        <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
                          {asset.platform}
                        </span>
                      </span>
                      <span className={`min-w-0 ${view === "grid" ? "block p-3" : "flex-1"}`}>
                        <span className="block truncate text-sm font-gilroy-semibold text-gray-900">{asset.name}</span>
                        <span className="mt-1 block truncate text-xs text-gray-400">{asset.campaignName}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <Search className="size-8 text-gray-300" />
                <p className="mt-3 font-gilroy-semibold text-gray-700">No matching media</p>
                <p className="mt-1 text-sm text-gray-400">Change the search or platform filter.</p>
              </div>
            )}
          </div>

          {hasChosenMedia && (
            <div className="border-t border-gray-100 bg-[#fafafa] p-5 md:p-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-gilroy-bold text-gray-950">
                    {selectedAssets.length
                      ? `${selectedAssets.length} asset${selectedAssets.length === 1 ? "" : "s"} selected`
                      : `${currentMedia.length} campaign asset${currentMedia.length === 1 ? "" : "s"} ready`}
                  </p>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(selectedAssets.length ? selectedAssets : currentMedia).map((item, index) => {
                      const url = "url" in item ? item.url : item.mediaUrl;
                      const platform = item.platform;
                      return (
                        <span key={`${platform}-${url}-${index}`} className="relative block size-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                          {isVideoUrl(url) ? (
                            <video src={url} muted className="h-full w-full object-cover" />
                          ) : (
                            <Image src={url} alt="" fill sizes="64px" className="object-cover" unoptimized />
                          )}
                          <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px] uppercase text-white">{platform}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {platforms.length > 1 && (
                  <label className="flex max-w-md items-start justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <span>
                      <span className="block text-sm font-gilroy-semibold text-violet-950">Use the same creative across platforms</span>
                      <span className="mt-1 block text-xs leading-5 text-violet-700">
                        Copy and call-to-action stay in sync. Meta still uses an image and TikTok still uses a video.
                      </span>
                    </span>
                    <Switch
                      checked={sameCreativeForAll}
                      onCheckedChange={onSameCreativeForAllChange}
                      className="shrink-0 data-[state=checked]:bg-khaki-300"
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={setupAds}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-khaki-300 px-6 py-3 text-sm font-gilroy-bold text-black-800 transition-colors hover:bg-darkkhaki-200"
                >
                  Setup {selectedAssets.length > 1 || currentMedia.length > 1 ? "ads" : "ad"}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default CreativeSetupScreen;
