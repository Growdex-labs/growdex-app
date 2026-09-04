"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Grid2X2,
  Images,
  List,
  Loader2,
  Megaphone,
  RefreshCw,
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
  persistLibraryUpload,
  type CreativeAsset,
} from "@/lib/assets";
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
  const [tab, setTab] = useState<LibraryTab>("assets");
  const [view, setView] = useState<LibraryView>("grid");
  const [selected, setSelected] = useState<CreativeAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; index: number; total: number; percent: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const providerCache = useRef(new Map<string, CreativeAsset[]>());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setRefreshMessage(null);
    void (async () => {
      try {
        const campaignAssets = await fetchCreativeAssets();
        let providerMedia: CreativeAsset[] = [];
        const socialSetup = await hydrateSocialAccounts();
        const warnings: string[] = [];
        if (socialSetup.success && socialSetup.data) {
          const sources = [
            ...(socialSetup.data.meta?.assets ?? []).map((asset) => ({
              key: `meta-posts:${asset.id}`,
              load: () => fetchMetaSocialPosts(asset.id),
            })),
            ...(socialSetup.data.tiktok?.assets ?? []).flatMap((asset) => [
              { key: `tiktok-assets:${asset.id}`, load: () => fetchTikTokCreativeAssets(asset.id) },
              { key: `tiktok-posts:${asset.id}`, load: () => fetchTikTokSocialPosts(asset.id) },
            ]),
          ];
          const providerResults = await Promise.allSettled(sources.map((source) => source.load()));
          if (!active) return;
          const nextCache = new Map<string, CreativeAsset[]>();
          for (const [index, result] of providerResults.entries()) {
            const key = sources[index].key;
            nextCache.set(key, result.status === "fulfilled" ? result.value : providerCache.current.get(key) ?? []);
            if (result.status === "rejected") {
              warnings.push(result.reason instanceof Error ? result.reason.message : "Some connected posts could not be refreshed. Please try again.");
            }
          }
          providerCache.current = nextCache;
          providerMedia = [...nextCache.values()].flat();
        } else {
          warnings.push("Connected accounts could not be loaded. Please refresh to try again.");
          providerMedia = [...providerCache.current.values()].flat();
        }
        if (active) {
          setRefreshMessage(warnings.length ? [...new Set(warnings)].join(" ") : refreshVersion > 0 ? "Assets and connected posts refreshed." : null);
          setAssets(
            [...campaignAssets, ...providerMedia].filter(
              (asset, index, library) =>
                library.findIndex(
                  (candidate) =>
                    candidate.id === asset.id ||
                    (candidate.kind === asset.kind && candidate.url === asset.url),
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
  }, [refreshVersion]);

  const visibleAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (tab === "posts" && asset.kind !== "post") return false;
      if (tab === "assets" && asset.kind !== "asset") return false;
      return (
        !normalized ||
        asset.name.toLowerCase().includes(normalized) ||
        asset.campaignName.toLowerCase().includes(normalized)
      );
    });
  }, [assets, query, tab]);

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

    for (const [index, file] of files.entries()) {
      setUploadProgress({ name: file.name, index: index + 1, total: files.length, percent: 0 });
      try {
        uploaded.push(persistLibraryUpload(await uploadCreativeToCloudinary(file, (percent) => {
          setUploadProgress({ name: file.name, index: index + 1, total: files.length, percent });
        })));
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
    setUploadProgress(null);
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
                Upload and reuse images or videos in any of your campaigns.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setRefreshVersion((version) => version + 1)}
                disabled={loading || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
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
                disabled={uploading || loading}
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
          {error && assets.length > 0 && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Refresh failed: {error} Your previously loaded assets are still available.</p>}
          {refreshMessage && <p role="status" className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">{refreshMessage}</p>}
          {uploadProgress && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 truncate">{uploadProgress.index} of {uploadProgress.total}: {uploadProgress.name}</span>
                <span className="shrink-0 tabular-nums">{uploadProgress.percent}%</span>
              </div>
              <progress aria-label={`Upload progress for ${uploadProgress.name}`} value={uploadProgress.percent} max={100} className="mt-2 h-2 w-full accent-gray-950" />
              <p role="status" className="mt-1 text-xs text-gray-500">{uploadProgress.percent === 100 ? "Upload sent. Finishing and saving…" : "Uploading asset…"}</p>
            </div>
          )}
          {uploadError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {uploadError}
            </p>
          )}

          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
              {loading && assets.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-gray-400" />
                </div>
              ) : error && assets.length === 0 ? (
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
                    Upload a creative or create a campaign with hosted media.
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
