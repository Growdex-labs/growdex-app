"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Radio, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  forecastCampaignReach,
  type CampaignGoal,
  type CampaignPlatform,
  type CreateCampaignPayload,
  type MetaInterest,
} from "@/lib/campaigns";
import { metaSpecialAdLocations } from "@/lib/meta-special-ad-locations";
import type { SocialAccountSetupProps } from "@/types/social";
import { AudienceReachCard } from "./AudienceReachCard";

type Audience = CreateCampaignPayload["audience"];
type Tab = "sources" | "demographics" | "interests";

interface AudienceTargetingScreenProps {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  audience: Audience;
  accounts: SocialAccountSetupProps | null;
  connecting: CampaignPlatform | null;
  unavailableInterests: Record<string, MetaInterest[]>;
  onChange: (next: Partial<Audience>) => void;
  onConnect: (platform: CampaignPlatform) => void;
  onReplaceInterest: (unavailable: string, replacement: string) => void;
  onClearUnavailableInterests: () => void;
}

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "sources", label: "Event sources" },
  { id: "demographics", label: "Demographics" },
  { id: "interests", label: "Interests" },
];

const COUNTRIES = Object.entries(metaSpecialAdLocations).sort(([, a], [, b]) =>
  a.localeCompare(b),
);

const isConnected = (
  accounts: SocialAccountSetupProps | null,
  platform: CampaignPlatform,
) => Boolean(accounts?.[platform]?.connected && !accounts[platform]?.needsReauth);

export function AudienceTargetingScreen({
  goal,
  platforms,
  audience,
  accounts,
  connecting,
  unavailableInterests,
  onChange,
  onConnect,
  onReplaceInterest,
  onClearUnavailableInterests,
}: AudienceTargetingScreenProps) {
  const [tab, setTab] = useState<Tab>("sources");
  const [forecast, setForecast] = useState<Awaited<ReturnType<typeof forecastCampaignReach>> | null>(null);
  const [forecasting, setForecasting] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const selectedCountries = useMemo(() => new Set(audience.locations), [audience.locations]);
  const metaSelected = platforms.includes("meta");
  const metaConnected = isConnected(accounts, "meta");
  const canForecast = metaSelected && metaConnected && audience.locations.length > 0;

  useEffect(() => {
    if (!canForecast) return;

    let active = true;
    const timeout = window.setTimeout(() => {
      setForecasting(true);
      setForecastError(null);
      void forecastCampaignReach({ goal, audience })
        .then((result) => {
          if (active) setForecast(result);
        })
        .catch((failure) => {
          if (!active) return;
          setForecast(null);
          setForecastError(
            failure instanceof Error ? failure.message : "Could not forecast this audience.",
          );
        })
        .finally(() => {
          if (active) setForecasting(false);
        });
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [audience, canForecast, goal]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-gray-900">Find the people you want to reach</h2>
      <p className="mt-2 text-sm text-gray-500">
        Review the real publishing connections, demographics, and interests used by this campaign.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid gap-6 sm:grid-cols-[140px_minmax(0,1fr)]">
          <nav className="flex gap-2 overflow-x-auto sm:flex-col" aria-label="Audience settings">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${
                  tab === item.id
                    ? "border border-gray-300 font-medium text-gray-900"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            {tab === "sources" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Publishing and event sources</h3>
                <p className="text-xs text-gray-500">
                  Growdex uses the connected account for each selected platform when it creates and tracks the ad.
                </p>
                {platforms.map((platform) => {
                  const connected = isConnected(accounts, platform);
                  const name = platform === "meta"
                    ? accounts?.meta?.assets?.[0]?.adAccountName
                    : accounts?.tiktok?.assets?.[0]?.name;
                  return (
                    <div key={platform} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {platform === "meta" ? <Radio className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{platform === "meta" ? "Meta" : "TikTok"}</p>
                        <p className="truncate text-xs text-gray-400">{name || (connected ? "Connected account" : "No account connected")}</p>
                      </div>
                      {connected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><Check className="h-3.5 w-3.5" /> Connected</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onConnect(platform)}
                          disabled={connecting !== null}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 disabled:opacity-50"
                        >
                          {connecting === platform ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "demographics" && (
              <div className="space-y-5">
                <label className="block text-sm font-medium text-gray-700">
                  Add a country
                  <select
                    className="mt-2 h-11 w-full rounded-lg border bg-white px-3"
                    value=""
                    onChange={(event) => {
                      const code = event.target.value;
                      if (code && !selectedCountries.has(code)) {
                        onChange({ locations: [...audience.locations, code] });
                      }
                    }}
                  >
                    <option value="">Choose a country</option>
                    {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  {audience.locations.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onChange({ locations: audience.locations.filter((item) => item !== code) })}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {metaSpecialAdLocations[code as keyof typeof metaSpecialAdLocations] ?? code} ×
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">Minimum age<Input className="mt-2" type="number" min={18} max={65} value={audience.ageMin ?? 18} onChange={(event) => onChange({ ageMin: Number(event.target.value) })} /></label>
                  <label className="text-sm font-medium text-gray-700">Maximum age<Input className="mt-2" type="number" min={18} max={65} value={audience.ageMax ?? 65} onChange={(event) => onChange({ ageMax: Number(event.target.value) })} /></label>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                  <select className="mt-2 h-11 w-full rounded-lg border bg-white px-3" value={audience.gender ?? "all"} onChange={(event) => onChange({ gender: event.target.value as "all" | "male" | "female" })}>
                    <option value="all">All</option><option value="female">Women</option><option value="male">Men</option>
                  </select>
                </label>
              </div>
            )}

            {tab === "interests" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta interest names
                  <Input
                    className="mt-2"
                    value={(audience.interests ?? []).join(", ")}
                    onChange={(event) => {
                      onChange({ interests: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) });
                      onClearUnavailableInterests();
                    }}
                    placeholder="Business, technology"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-400">Separate interests with commas. Growdex checks them against Meta before continuing.</p>
                {Object.entries(unavailableInterests).map(([unavailable, suggestions]) => (
                  <div key={unavailable} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">“{unavailable}” is not an available Meta interest.</p>
                    {suggestions.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                          <button key={suggestion.id} type="button" onClick={() => onReplaceInterest(unavailable, suggestion.name)} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100">Use {suggestion.name}</button>
                        ))}
                      </div>
                    ) : <p className="mt-2 text-xs text-amber-800">Remove it or enter a different interest.</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AudienceReachCard
          forecast={canForecast ? forecast : null}
          loading={canForecast && forecasting}
          error={canForecast ? forecastError : null}
          metaSelected={metaSelected}
          metaConnected={metaConnected}
        />
      </div>
    </section>
  );
}

export default AudienceTargetingScreen;
