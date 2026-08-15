"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Film,
  Grid2X2,
  ImageIcon,
  Images,
  List,
  Loader2,
  Megaphone,
  Search,
  Upload,
} from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { isVideoMedia } from "@/lib/campaign-shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchCreativeAssets,
  fetchMetaSocialPosts,
  fetchTikTokCreativeAssets,
  fetchTikTokSocialPosts,
  assetPlatformLabel,
  assetServesPlatform,
  persistLibraryUpload,
  type CreativeAsset,
} from "@/lib/assets";
import type { CampaignPlatform } from "@/lib/campaigns";
import { uploadCreativeToCloudinary } from "@/lib/media-upload";
import { hydrateSocialAccounts } from "@/lib/social";

type LibraryTab = "assets" | "posts";
type LibraryView = "grid" | "list";

const statusLabel = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const isVideoAsset = (asset: CreativeAsset) =>
  isVideoMedia({
    url: asset.url,
    mediaType: asset.mediaType,
  });

export default function AssetsPage() {
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | CampaignPlatform>("all");
  const [tab, setTab] = useState<LibraryTab>("assets");
  const [view, setView] = useState<LibraryView>("grid");
  const [selected, setSelected] = useState<CreativeAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const campaignAssets = await fetchCreativeAssets();
        let providerMedia: CreativeAsset[] = [];
        const socialSetup = await hydrateSocialAccounts();
        if (socialSetup.success && socialSetup.data) {
          const providerResults = await Promise.allSettled([
            ...(socialSetup.data.meta?.assets ?? []).map((asset) =>
              fetchMetaSocialPosts(asset.id),
            ),
            ...(socialSetup.data.tiktok?.assets ?? []).map((asset) =>
              fetchTikTokCreativeAssets(asset.id),
            ),
            ...(socialSetup.data.tiktok?.assets ?? []).map((asset) =>
              fetchTikTokSocialPosts(asset.id),
            ),
          ]);
          providerMedia = providerResults.flatMap((result) =>
            result.status === "fulfilled" ? result.value : [],
          );
        }
        if (active) {
          setAssets(
            [...campaignAssets, ...providerMedia].filter(
              (asset, index, library) =>
                library.findIndex(
                  (candidate) =>
                    candidate.kind === asset.kind &&
                    candidate.url === asset.url,
                ) === index,
            ),
          );
        }
      } catch (failure) {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load the creative library.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const visibleAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (platform !== "all" && !assetServesPlatform(asset, platform)) {
        return false;
      }
      if (tab === "posts" && asset.kind !== "post") return false;
      if (tab === "assets" && asset.kind !== "asset") return false;
      return (
        !normalized ||
        asset.name.toLowerCase().includes(normalized) ||
        asset.campaignName.toLowerCase().includes(normalized)
      );
    });
  }, [assets, platform, query, tab]);

  const counts = useMemo(
    () => ({
      all: assets.length,
      meta: assets.filter((asset) => assetServesPlatform(asset, "meta")).length,
      tiktok: assets.filter((asset) => assetServesPlatform(asset, "tiktok"))
        .length,
    }),
    [assets],
  );

  const addUploadedAssets = (uploaded: CreativeAsset[]) => {
    setAssets((current) =>
      [...uploaded, ...current].filter(
        (asset, index, library) =>
          library.findIndex(
            (candidate) =>
              candidate.kind === asset.kind && candidate.url === asset.url,
          ) === index,
      ),
    );
    setTab("assets");
  };

  const handleUploadFiles = async (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);
    const uploaded: CreativeAsset[] = [];
    const failures: string[] = [];

    for (const file of files) {
      try {
        uploaded.push(persistLibraryUpload(await uploadCreativeToCloudinary(file)));
      } catch (failure) {
        failures.push(
          `${file.name}: ${
            failure instanceof Error ? failure.message : "Upload failed."
          }`,
        );
      }
    }

    if (uploaded.length) {
      addUploadedAssets(uploaded);
      setError(null);
    }
    if (failures.length) setUploadError(failures.join(" "));
    setUploading(false);
  };

  return (
    <PanelLayout>
      <main className="min-h-full bg-[#f5f5f5] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-dimGray">Assets</p>
              <h1 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
                Creative library
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Upload creatives or find media already used across your Meta and TikTok campaigns.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  void handleUploadFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <Link
                href="/panel/campaigns/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
              >
                <Megaphone className="size-4" /> Create campaign
              </Link>
            </div>
          </header>
          {uploadError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {uploadError}
            </p>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "All media", value: counts.all, icon: Images },
              { label: "Meta assets", value: counts.meta, icon: ImageIcon },
              { label: "TikTok assets", value: counts.tiktok, icon: Film },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <article key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{metric.label}</p>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-dimYellow text-gray-800">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-gilroy-bold text-gray-950">
                    {loading ? "—" : metric.value}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:p-5">
              <div className="relative min-w-56 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search assets or campaigns"
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
                />
              </div>

              <div className="flex rounded-xl bg-gray-100 p-1">
                {(["assets", "posts"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={`flex-1 rounded-lg px-4 py-1.5 text-sm capitalize transition-colors ${
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
                value={platform}
                onChange={(event) =>
                  setPlatform(event.target.value as "all" | CampaignPlatform)
                }
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600"
              >
                <option value="all">All platforms</option>
                <option value="meta">Meta</option>
                <option value="tiktok">TikTok</option>
              </select>

              <div className="flex overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={`flex-1 p-2.5 ${view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <Grid2X2 className="mx-auto size-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={`flex-1 p-2.5 ${view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <List className="mx-auto size-4" />
                </button>
              </div>
            </div>

            <div className="p-4 lg:p-5">
              {loading ? (
                <div className="flex min-h-80 items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                  <AlertCircle className="size-8" />
                  <p className="mt-3 font-gilroy-semibold">Creative library unavailable</p>
                  <p className="mt-1">{error}</p>
                </div>
              ) : visibleAssets.length ? (
                <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "space-y-3"}>
                  {visibleAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelected(asset)}
                      className={`group overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-khaki-300 hover:shadow-md ${
                        view === "list" ? "flex items-center gap-4 p-3" : ""
                      }`}
                    >
                      <span className={`relative block shrink-0 overflow-hidden bg-gray-100 ${view === "grid" ? "aspect-4/3 w-full" : "h-20 w-28 rounded-lg"}`}>
                        {isVideoAsset(asset) && !asset.thumbnailUrl ? (
                          <video
                            src={asset.url}
                            muted
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={asset.thumbnailUrl ?? asset.url}
                            alt=""
                            fill
                            sizes={view === "grid" ? "360px" : "112px"}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
                          {assetPlatformLabel(asset)}
                        </span>
                      </span>
                      <span className={`min-w-0 ${view === "grid" ? "block p-3" : "flex-1"}`}>
                        <span className="block truncate font-gilroy-semibold text-gray-900">
                          {asset.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-gray-500">
                          {asset.campaignName}
                        </span>
                        <span className="mt-3 flex items-center justify-between gap-3 text-[11px] text-gray-400">
                          <span className="capitalize">{statusLabel(asset.status)}</span>
                          {asset.createdAt && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(asset.createdAt))}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center text-center">
                  <Images className="size-10 text-gray-300" />
                  <p className="mt-3 font-gilroy-semibold text-gray-900">No media found</p>
                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Upload a creative, change the filters, or create a campaign with hosted media.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-gilroy-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploading ? "Uploading…" : "Upload creative"}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        <Dialog
          open={selected !== null}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
            {selected && (
              <>
                <DialogHeader className="border-b border-gray-100 px-5 py-4 pr-14 text-left">
                  <DialogTitle className="truncate font-gilroy-semibold text-gray-900">
                    {selected.name}
                  </DialogTitle>
                  <DialogDescription className="truncate text-xs text-dimGray">
                    {selected.campaignName}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex max-h-[70vh] min-h-80 items-center justify-center bg-gray-950">
                  {isVideoAsset(selected) ? (
                    <video
                      src={selected.url}
                      poster={selected.thumbnailUrl}
                      controls
                      playsInline
                      className="max-h-[70vh] max-w-full"
                    />
                  ) : (
                    <div className="relative h-[60vh] w-full">
                      <Image src={selected.url} alt={selected.name} fill sizes="900px" className="object-contain" unoptimized />
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </PanelLayout>
  );
}
