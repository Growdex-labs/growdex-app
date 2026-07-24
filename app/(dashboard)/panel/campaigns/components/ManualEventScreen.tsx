"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import {
  fetchCampaignEventSources,
  type CampaignEventSource,
  type CampaignOptimizationGoal,
  type CampaignPlatform,
} from "@/lib/campaigns";

interface ManualEventScreenProps {
  platforms: CampaignPlatform[];
  accountAssetIds: Partial<Record<CampaignPlatform, string>>;
  eventSourceIds: Partial<Record<CampaignPlatform, string>>;
  optimizationGoal: CampaignOptimizationGoal;
  onChange: (next: Partial<Record<CampaignPlatform, string>>) => void;
}

export function ManualEventScreen({
  platforms,
  accountAssetIds,
  eventSourceIds,
  optimizationGoal,
  onChange,
}: ManualEventScreenProps) {
  const [sources, setSources] = useState<CampaignEventSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const required = optimizationGoal === "CONVERSIONS";

  useEffect(() => {
    if (!required) {
      return;
    }
    let active = true;
    void Promise.resolve()
      .then(() => {
        if (!active) return [];
        setLoading(true);
        setError(null);
        return Promise.all(
          platforms.map((platform) => {
            const assetId = accountAssetIds[platform];
            if (!assetId) {
              throw new Error(
                `Select a ${platform === "meta" ? "Meta" : "TikTok"} account first.`,
              );
            }
            return fetchCampaignEventSources(platform, assetId);
          }),
        );
      })
      .then((results) => {
        if (active) setSources(results.flat());
      })
      .catch((failure) => {
        if (active) {
          setSources([]);
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load event sources.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accountAssetIds, platforms, required]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sources;
    return sources.filter(
      (source) =>
        source.name.toLowerCase().includes(normalized) ||
        source.id.toLowerCase().includes(normalized),
    );
  }, [query, sources]);

  if (!required) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-900">
          No additional tracking needed
        </p>
        <p className="mt-1 text-xs text-green-700">
          Results are collected and measured directly by the ad platform, so
          you don&apos;t need to connect a website pixel.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">
        Select conversion event sources
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        These are loaded live from the ad accounts selected in the previous
        step.
      </p>
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pixels by name or ID"
          className="h-10 w-full rounded-full border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
        />
      </div>

      {loading ? (
        <div className="flex min-h-28 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : filtered.length ? (
        <div className="mt-4 space-y-3">
          {filtered.map((source) => {
            const selected = eventSourceIds[source.platform] === source.id;
            return (
              <button
                key={`${source.platform}-${source.id}`}
                type="button"
                disabled={!source.available}
                onClick={() =>
                  onChange({ ...eventSourceIds, [source.platform]: source.id })
                }
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected ? "border-khaki-300" : "border-gray-200"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    selected
                      ? "border-khaki-300 bg-khaki-200"
                      : "border-gray-300"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {source.name}
                  </span>
                  <span className="block text-[11px] uppercase text-gray-400">
                    {source.platform} · {source.id}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
          No available pixels were returned by the selected account.
        </p>
      )}
    </div>
  );
}

export default ManualEventScreen;
