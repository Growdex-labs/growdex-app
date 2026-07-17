"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Monitor, Search, Smartphone, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchAudiences, type Audience as SavedAudience } from "@/lib/audiences";
import {
  searchProviderLanguages,
  type CampaignPlatform,
  type CreateCampaignPayload,
  type MetaInterest,
  type ProviderLanguage,
} from "@/lib/campaigns";
import { metaSpecialAdLocations } from "@/lib/meta-special-ad-locations";

type Audience = CreateCampaignPayload["audience"];
type Tab = "demographics" | "audiences" | "interests" | "devices" | "advanced";

interface DemographicsFormProps {
  platforms: CampaignPlatform[];
  accountAssetIds: Partial<Record<CampaignPlatform, string>>;
  audience: Audience;
  unavailableInterests: Record<string, MetaInterest[]>;
  onChange: (next: Partial<Audience>) => void;
  onReplaceInterest: (unavailable: string, replacement: string) => void;
  onClearUnavailableInterests: () => void;
}

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "demographics", label: "Demographics" },
  { id: "audiences", label: "Saved audiences" },
  { id: "interests", label: "Interests" },
  { id: "devices", label: "Devices" },
  { id: "advanced", label: "Advanced" },
];

const COUNTRIES = Object.entries(metaSpecialAdLocations).sort(([, a], [, b]) =>
  a.localeCompare(b),
);

const audienceLocations = (saved: SavedAudience) =>
  [...(saved.country ?? []), ...(saved.locations ?? [])].filter((value) =>
    /^[A-Z]{2}$/.test(value),
  );

export function DemographicsForm({
  platforms,
  accountAssetIds,
  audience,
  unavailableInterests,
  onChange,
  onReplaceInterest,
  onClearUnavailableInterests,
}: DemographicsFormProps) {
  const [tab, setTab] = useState<Tab>("demographics");
  const [savedAudiences, setSavedAudiences] = useState<SavedAudience[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [languageQuery, setLanguageQuery] = useState("");
  const [languages, setLanguages] = useState<ProviderLanguage[]>([]);
  const [languageLoading, setLanguageLoading] = useState(false);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const selectedCountries = useMemo(
    () => new Set(audience.locations),
    [audience.locations],
  );

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab !== "audiences" || savedAudiences.length || savedLoading) return;
    let active = true;
    setSavedLoading(true);
    setSavedError(null);
    void fetchAudiences()
      .then((result) => {
        if (active) setSavedAudiences(result);
      })
      .catch((failure) => {
        if (active) {
          setSavedError(
            failure instanceof Error
              ? failure.message
              : "Could not load saved audiences.",
          );
        }
      })
      .finally(() => {
        if (active) setSavedLoading(false);
      });
    return () => {
      active = false;
    };
  };

  useEffect(() => {
    if (tab !== "demographics" || languageQuery.trim().length < 2) {
      return;
    }
    let active = true;
    const timeout = window.setTimeout(() => {
      setLanguageLoading(true);
      setLanguageError(null);
      void Promise.all(
        platforms.map((platform) => {
          const assetId = accountAssetIds[platform];
          if (!assetId) {
            throw new Error(
              `Select a ${platform === "meta" ? "Meta" : "TikTok"} account first.`,
            );
          }
          return searchProviderLanguages(platform, assetId, languageQuery.trim());
        }),
      )
        .then((results) => {
          if (!active) return;
          if (results.length === 1) {
            setLanguages(results[0]);
            return;
          }
          const [first, ...rest] = results;
          setLanguages(
            first.filter((language) =>
              rest.every((list) =>
                list.some(
                  (candidate) =>
                    candidate.name.toLowerCase() === language.name.toLowerCase(),
                ),
              ),
            ),
          );
        })
        .catch((failure) => {
          if (active) {
            setLanguageError(
              failure instanceof Error
                ? failure.message
                : "Could not search provider languages.",
            );
          }
        })
        .finally(() => {
          if (active) setLanguageLoading(false);
        });
    }, 400);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accountAssetIds, languageQuery, platforms, tab]);

  const applySavedAudience = (saved: SavedAudience) => {
    const locations = audienceLocations(saved);
    onChange({
      includeAudienceIds: [
        ...new Set([...(audience.includeAudienceIds ?? []), saved.id]),
      ],
      excludeAudienceIds: (audience.excludeAudienceIds ?? []).filter(
        (id) => id !== saved.id,
      ),
      locations: [...new Set([...audience.locations, ...locations])],
      interests: [
        ...new Set([...(audience.interests ?? []), ...(saved.interests ?? [])]),
      ],
      ageMin: saved.metaConfig?.ageMin ?? audience.ageMin,
      ageMax: saved.metaConfig?.ageMax ?? audience.ageMax,
      gender:
        saved.metaConfig?.gender === "male" ||
        saved.metaConfig?.gender === "female" ||
        saved.metaConfig?.gender === "all"
          ? saved.metaConfig.gender
          : audience.gender,
    });
  };

  const excludeSavedAudience = (saved: SavedAudience) => {
    const locations = new Set(audienceLocations(saved));
    const interests = new Set(
      (saved.interests ?? []).map((interest) => interest.toLowerCase()),
    );
    onChange({
      excludeAudienceIds: [
        ...new Set([...(audience.excludeAudienceIds ?? []), saved.id]),
      ],
      includeAudienceIds: (audience.includeAudienceIds ?? []).filter(
        (id) => id !== saved.id,
      ),
      locations: audience.locations.filter((location) => !locations.has(location)),
      interests: (audience.interests ?? []).filter(
        (interest) => !interests.has(interest.toLowerCase()),
      ),
    });
  };

  const toggleDevice = (device: "mobile" | "desktop") => {
    const current = audience.devices ?? [];
    const next = current.includes(device)
      ? current.filter((item) => item !== device)
      : [...current, device];
    if (next.length) onChange({ devices: next });
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[150px_minmax(0,1fr)]">
      <nav className="flex gap-2 overflow-x-auto sm:flex-col" aria-label="Audience settings">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeTab(item.id)}
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
                {COUNTRIES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              {audience.locations.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    onChange({
                      locations: audience.locations.filter((item) => item !== code),
                    })
                  }
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {metaSpecialAdLocations[
                    code as keyof typeof metaSpecialAdLocations
                  ] ?? code}{" "}
                  ×
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Minimum age
                <Input
                  className="mt-2"
                  type="number"
                  min={18}
                  max={65}
                  value={audience.ageMin ?? 18}
                  onChange={(event) => onChange({ ageMin: Number(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Maximum age
                <Input
                  className="mt-2"
                  type="number"
                  min={18}
                  max={65}
                  value={audience.ageMax ?? 65}
                  onChange={(event) => onChange({ ageMax: Number(event.target.value) })}
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
              <select
                className="mt-2 h-11 w-full rounded-lg border bg-white px-3"
                value={audience.gender ?? "all"}
                onChange={(event) =>
                  onChange({
                    gender: event.target.value as "all" | "male" | "female",
                  })
                }
              >
                <option value="all">All</option>
                <option value="female">Women</option>
                <option value="male">Men</option>
              </select>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Languages
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-9"
                    value={languageQuery}
                    onChange={(event) => setLanguageQuery(event.target.value)}
                    placeholder="Search provider languages"
                  />
                  {languageLoading && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>
              </label>
              {languageError && (
                <p className="mt-2 text-xs text-red-600">{languageError}</p>
              )}
              {languageQuery.trim().length >= 2 && languages.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {languages.map((language) => (
                    <button
                      key={`${language.id}-${language.name}`}
                      type="button"
                      onClick={() => {
                        onChange({
                          languages: [
                            ...new Set([...(audience.languages ?? []), language.name]),
                          ],
                        });
                        setLanguageQuery("");
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {(audience.languages ?? []).map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() =>
                      onChange({
                        languages: (audience.languages ?? []).filter(
                          (item) => item !== language,
                        ),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {language} <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "audiences" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Reuse saved audience criteria
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Include applies saved locations, ages, gender, and interests.
              Exclude removes overlapping saved criteria from this campaign.
            </p>
            {savedLoading ? (
              <div className="flex min-h-28 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : savedError ? (
              <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {savedError}
              </p>
            ) : savedAudiences.length ? (
              <div className="mt-4 space-y-3">
                {savedAudiences.map((saved) => {
                  const included = (audience.includeAudienceIds ?? []).includes(saved.id);
                  const excluded = (audience.excludeAudienceIds ?? []).includes(saved.id);
                  return (
                    <div key={saved.id} className="rounded-xl border border-gray-200 p-4">
                      <p className="text-sm font-medium text-gray-900">{saved.name}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {audienceLocations(saved).length} countries · {saved.interests?.length ?? 0} interests
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => applySavedAudience(saved)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                            included
                              ? "border-khaki-300 bg-dimYellow/30"
                              : "border-gray-300"
                          }`}
                        >
                          {included && <Check className="mr-1 inline h-3 w-3" />}
                          Include
                        </button>
                        <button
                          type="button"
                          onClick={() => excludeSavedAudience(saved)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                            excluded
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-gray-300"
                          }`}
                        >
                          Exclude criteria
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                No saved audiences yet.
              </p>
            )}
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
                  onChange({
                    interests: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  });
                  onClearUnavailableInterests();
                }}
                placeholder="Business, technology"
              />
            </label>
            <p className="mt-2 text-xs text-gray-400">
              Growdex checks every name against Meta before continuing.
            </p>
            {Object.entries(unavailableInterests).map(
              ([unavailable, suggestions]) => (
                <div
                  key={unavailable}
                  className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                  <p className="text-sm font-medium text-amber-900">
                    “{unavailable}” is not an available Meta interest.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() =>
                          onReplaceInterest(unavailable, suggestion.name)
                        }
                        className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900"
                      >
                        Use {suggestion.name}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {tab === "devices" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Preferred traffic from
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              TikTok delivery is mobile-only. Meta campaigns can also target
              desktop.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { id: "mobile" as const, label: "Mobile & tablet", Icon: Smartphone, disabled: false },
                { id: "desktop" as const, label: "Desktop", Icon: Monitor, disabled: platforms.includes("tiktok") },
              ].map(({ id, label, Icon, disabled }) => {
                const selected = (audience.devices ?? []).includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDevice(id)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected ? "border-khaki-300 bg-dimYellow/30" : "border-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                    {selected && <Check className="ml-auto h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "advanced" && (
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900">
              Delivery summary
            </h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-gray-400">Countries</dt><dd className="font-medium text-gray-800">{audience.locations.length}</dd></div>
              <div><dt className="text-gray-400">Age</dt><dd className="font-medium text-gray-800">{audience.ageMin ?? 18}–{audience.ageMax ?? 65}</dd></div>
              <div><dt className="text-gray-400">Languages</dt><dd className="font-medium text-gray-800">{audience.languages?.length || "All"}</dd></div>
              <div><dt className="text-gray-400">Devices</dt><dd className="font-medium capitalize text-gray-800">{(audience.devices ?? ["mobile"]).join(", ")}</dd></div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              Growdex sends only the choices shown here. It does not silently
              broaden this audience or switch accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemographicsForm;
