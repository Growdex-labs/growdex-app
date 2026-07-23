"use client";

import { useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { isVideoUrl } from "@/lib/campaign-shared";
import {
  fetchCreativeAssets,
  fetchMetaSocialPosts,
  fetchTikTokCreativeAssets,
  fetchTikTokSocialPosts,
  type CreativeAsset,
} from "@/lib/assets";
import type { CampaignPlatform } from "@/lib/campaigns";
import { hydrateSocialAccounts } from "@/lib/social";

type LibraryTab = "assets" | "posts";
type LibraryView = "grid" | "list";

const statusLabel = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AssetsPage() {
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | CampaignPlatform>("all");
  const [tab, setTab] = useState<LibraryTab>("assets");
  const [view, setView] = useState<LibraryView>("grid");
  const [selected, setSelected] = useState<CreativeAsset | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([fetchCreativeAssets(), hydrateSocialAccounts()])
      .then(async ([campaignAssets, socialSetup]) => {
        if (!socialSetup.success || !socialSetup.data) {
          throw new Error(
            socialSetup.error ?? "Could not load connected social accounts.",
          );
        }
        const providerMedia = (
          await Promise.all(
            [
              ...(socialSetup.data.meta?.assets ?? []).map((asset) =>
                fetchMetaSocialPosts(asset.id),
              ),
              ...(socialSetup.data.tiktok?.assets ?? []).map((asset) =>
                fetchTikTokCreativeAssets(asset.id),
              ),
              ...(socialSetup.data.tiktok?.assets ?? []).map((asset) =>
                fetchTikTokSocialPosts(asset.id),
              ),
            ],
          )
        ).flat();
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
      })
      .catch((failure) => {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load the creative library.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (platform !== "all" && asset.platform !== platform) return false;
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
      meta: assets.filter((asset) => asset.platform === "meta").length,
      tiktok: assets.filter((asset) => asset.platform === "tiktok").length,
    }),
    [assets],
  );

  return (
    <PanelLayout>
      <main className="min-h-full bg-[#f5f5f5] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-gray-400">Assets</p>
              <h1 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
                Creative library
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Find media already used across your Meta and TikTok campaigns.
              </p>
            </div>
            <Link
              href="/panel/campaigns/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
            >
              <Megaphone className="size-4" /> Create campaign
            </Link>
          </header>

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
                        {isVideoUrl(asset.url) ? (
                          <video src={asset.url} muted className="h-full w-full object-cover" />
                        ) : (
                          <Image
                            src={asset.url}
                            alt=""
                            fill
                            sizes={view === "grid" ? "360px" : "112px"}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
                          {asset.platform}
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
                    Change the filters or create a campaign with hosted media to add it here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Asset preview">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-gilroy-semibold text-gray-900">{selected.name}</p>
                  <p className="truncate text-xs text-gray-400">{selected.campaignName}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} aria-label="Close asset preview" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex max-h-[70vh] min-h-80 items-center justify-center bg-gray-950">
                {isVideoUrl(selected.url) ? (
                  <video src={selected.url} controls className="max-h-[70vh] max-w-full" />
                ) : (
                  <div className="relative h-[60vh] w-full">
                    <Image src={selected.url} alt={selected.name} fill sizes="900px" className="object-contain" unoptimized />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </PanelLayout>
  );
}
