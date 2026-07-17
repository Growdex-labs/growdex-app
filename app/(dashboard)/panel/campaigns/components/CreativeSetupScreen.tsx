"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  Grid2X2,
  List,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { isVideoUrl } from "@/lib/campaign-shared";
import {
  fetchCreativeAssets,
  PUBLISHED_CAMPAIGN_STATUSES,
  type CreativeAsset,
} from "@/lib/assets";
import {
  type CampaignCreativeInput,
  type CampaignCta,
  type CampaignGoal,
  type CampaignPlatform,
} from "@/lib/campaigns";

interface CreativeSetupScreenProps {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  creatives: CampaignCreativeInput[];
  ctaOptions: Array<{ value: CampaignCta; label: string }>;
  uploading: number | null;
  sameCreativeForAll: boolean;
  onSameCreativeForAllChange: (checked: boolean) => void;
  onChange: (index: number, next: Partial<CampaignCreativeInput>) => void;
  onReplace: (creatives: CampaignCreativeInput[]) => void;
  onUpload: (index: number, platform: CampaignPlatform, file: File) => void;
}

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

export function CreativeSetupScreen({
  goal,
  platforms,
  creatives,
  ctaOptions,
  uploading,
  sameCreativeForAll,
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
  const [platformFilter, setPlatformFilter] = useState<"all" | CampaignPlatform>(
    "all",
  );
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    void fetchCreativeAssets({ platforms })
      .then((assets) => {
        if (!active) return;
        setLibrary(assets);
      })
      .catch((failure) => {
        if (active) {
          setLibraryError(
            failure instanceof Error
              ? failure.message
              : "Could not load the creative library.",
          );
        }
      })
      .finally(() => {
        if (active) setLibraryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [platforms]);

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

  const selectedAssets = visibleAssets.filter((asset) =>
    selected.includes(asset.id),
  );
  const allVisibleSelected =
    visibleAssets.length > 0 &&
    visibleAssets.every((asset) => selected.includes(asset.id));

  const toggleAsset = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 6
          ? [...current, id]
          : current,
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(visibleAssets.map((asset) => asset.id));
      setSelected((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }
    setSelected(visibleAssets.slice(0, 6).map((asset) => asset.id));
  };

  const useSelectedAssets = () => {
    if (!selectedAssets.length) return;
    const next = selectedAssets.map((asset) =>
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
    onReplace(next.slice(0, 6));
    setSelected([]);
  };

  const removeCreative = (index: number) => {
    const creative = creatives[index];
    if (
      creatives.filter((item) => item.platform === creative.platform).length <= 1
    ) {
      return;
    }
    onReplace(creatives.filter((_, creativeIndex) => creativeIndex !== index));
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 p-6 md:px-8">
        <h2 className="text-xl font-bold text-gray-900">
          Setup your ad creatives
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Reuse media from real Growdex campaigns or upload new hosted assets,
          then edit each platform preview.
        </p>
      </header>

      <div className="border-b border-gray-100 p-5 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creative library"
              className="h-10 w-full rounded-full bg-gray-50 pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-violet-200"
            />
          </div>
          <div className="flex rounded-full bg-gray-100 p-1">
            {(["posts", "assets"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                  tab === item ? "bg-white font-medium shadow-sm" : "text-gray-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <select
            value={platformFilter}
            onChange={(event) =>
              setPlatformFilter(
                event.target.value as "all" | CampaignPlatform,
              )
            }
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
          >
            <option value="all">All platforms</option>
            {platforms.includes("meta") && <option value="meta">Meta</option>}
            {platforms.includes("tiktok") && (
              <option value="tiktok">TikTok</option>
            )}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-gray-100" : "text-gray-400"}`}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-gray-100" : "text-gray-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="accent-khaki-300"
            />
            Select all visible (up to 6)
          </label>
          <span className="text-gray-400">{selected.length} selected</span>
          <button
            type="button"
            disabled={!selectedAssets.length}
            onClick={useSelectedAssets}
            className="ml-auto rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            Use selected media
          </button>
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-gray-100 p-3">
          {libraryLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : libraryError ? (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {libraryError}
            </p>
          ) : visibleAssets.length ? (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                  : "space-y-2"
              }
            >
              {visibleAssets.map((asset) => {
                const isSelected = selected.includes(asset.id);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleAsset(asset.id)}
                    className={`relative overflow-hidden rounded-xl border-2 text-left ${
                      isSelected ? "border-khaki-300" : "border-transparent"
                    } ${view === "list" ? "flex items-center gap-3 bg-gray-50 p-2" : ""}`}
                  >
                    <span
                      className={`relative block shrink-0 overflow-hidden bg-gray-100 ${
                        view === "grid" ? "aspect-4/3 w-full" : "h-14 w-20 rounded-lg"
                      }`}
                    >
                      {isVideoUrl(asset.url) ? (
                        <video className="h-full w-full object-cover" src={asset.url} muted />
                      ) : (
                        <Image
                          className="h-full w-full object-cover"
                          src={asset.url}
                          alt=""
                          fill
                          sizes="240px"
                          unoptimized
                        />
                      )}
                      <span
                        className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded border ${
                          isSelected
                            ? "border-khaki-300 bg-khaki-200"
                            : "border-gray-300 bg-white/90"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </span>
                    </span>
                    <span className={`min-w-0 ${view === "grid" ? "block p-2" : "flex-1"}`}>
                      <span className="block truncate text-xs font-medium text-gray-800">
                        {asset.name}
                      </span>
                      <span className="block truncate text-[10px] uppercase text-gray-400">
                        {asset.platform} · {asset.campaignName}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="flex min-h-32 items-center justify-center text-sm text-gray-500">
              {tab === "posts"
                ? "No published campaign media matches these filters."
                : "No saved campaign media matches these filters."}
            </p>
          )}
        </div>

        <label className="mt-4 flex items-start justify-between gap-4 rounded-xl bg-violet-50 p-4">
          <span>
            <span className="block text-sm font-medium text-violet-950">
              Reuse the same copy across platforms
            </span>
            <span className="mt-1 block text-xs text-violet-700">
              Text, headline, and call-to-action stay in sync. Media remains
              platform-specific because Meta requires images and TikTok requires video.
            </span>
          </span>
          <Switch
            checked={sameCreativeForAll}
            onCheckedChange={onSameCreativeForAllChange}
            className="data-[state=checked]:bg-khaki-300"
          />
        </label>
      </div>

      <div className="space-y-8 p-6 md:p-8">
        {creatives.map((creative, index) => {
          const platform = creative.platform;
          const canRemove =
            creatives.filter((item) => item.platform === platform).length > 1;
          return (
            <fieldset
              key={`${platform}-${index}-${creative.mediaUrl}`}
              className="grid gap-6 rounded-2xl border border-gray-200 p-5 lg:grid-cols-[minmax(0,1fr)_320px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <legend className="font-semibold text-gray-900">
                    {platform === "meta" ? "Meta image ad" : "TikTok video ad"}
                    {creatives.filter((item) => item.platform === platform).length > 1
                      ? ` ${creatives.slice(0, index + 1).filter((item) => item.platform === platform).length}`
                      : ""}
                  </legend>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => removeCreative(index)}
                      className="inline-flex items-center gap-1 text-xs text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary text
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-lg border p-3"
                    maxLength={125}
                    value={creative.primaryText}
                    onChange={(event) =>
                      onChange(index, { primaryText: event.target.value })
                    }
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">
                    Headline
                    <Input
                      className="mt-2"
                      maxLength={40}
                      value={creative.headline ?? ""}
                      onChange={(event) =>
                        onChange(index, { headline: event.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Call to action
                    <select
                      className="mt-2 h-10 w-full rounded-md border bg-white px-3"
                      value={creative.cta}
                      onChange={(event) =>
                        onChange(index, {
                          cta: event.target.value as CampaignCta,
                        })
                      }
                    >
                      {ctaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Landing page URL{platform === "meta" ? " *" : ""}
                  <Input
                    className="mt-2"
                    type="url"
                    value={creative.landingPageUrl ?? ""}
                    onChange={(event) =>
                      onChange(index, {
                        landingPageUrl: event.target.value || undefined,
                      })
                    }
                    placeholder="https://example.com/offer"
                  />
                </label>
                {goal === "LEADS" && (
                  <label className="block text-sm font-medium text-gray-700">
                    Lead form ID
                    <Input
                      className="mt-2"
                      value={creative.leadFormId ?? ""}
                      onChange={(event) =>
                        onChange(index, { leadFormId: event.target.value })
                      }
                    />
                  </label>
                )}
                {goal === "APP_PROMOTION" && (
                  <label className="block text-sm font-medium text-gray-700">
                    App ID
                    <Input
                      className="mt-2"
                      value={creative.appId ?? ""}
                      onChange={(event) =>
                        onChange(index, { appId: event.target.value })
                      }
                    />
                  </label>
                )}
                <label className="block text-sm font-medium text-gray-700">
                  Hosted media URL
                  <Input
                    className="mt-2"
                    type="url"
                    value={creative.mediaUrl}
                    onChange={(event) =>
                      onChange(index, { mediaUrl: event.target.value })
                    }
                    placeholder="https://res.cloudinary.com/…"
                  />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {uploading === index ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {uploading === index
                    ? "Uploading…"
                    : `Upload ${platform === "meta" ? "image" : "video"}`}
                  <input
                    className="hidden"
                    type="file"
                    disabled={uploading !== null}
                    accept={platform === "meta" ? "image/*" : "video/*"}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onUpload(index, platform, file);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>

              <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Live {platform} preview
                  </p>
                  <p className="mt-3 text-sm text-gray-700">
                    {creative.primaryText || "Your primary text will appear here."}
                  </p>
                </div>
                {creative.mediaUrl ? (
                  isVideoUrl(creative.mediaUrl) ? (
                    <video
                      className="aspect-video w-full bg-gray-100 object-cover"
                      src={creative.mediaUrl}
                      controls
                    />
                  ) : (
                    <Image
                      className="aspect-video w-full bg-gray-100 object-cover"
                      src={creative.mediaUrl}
                      alt={`${platform} creative preview`}
                      width={640}
                      height={360}
                      unoptimized
                    />
                  )
                ) : (
                  <div className="flex aspect-video items-center justify-center border-y border-gray-200 bg-white text-xs text-gray-400">
                    Upload {platform === "meta" ? "an image" : "a video"} to
                    preview it
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {creative.headline || "Ad headline"}
                  </p>
                  <span className="shrink-0 rounded-md border bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    {creative.cta.replaceAll("_", " ")}
                  </span>
                </div>
              </aside>
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}

export default CreativeSetupScreen;
