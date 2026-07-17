"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/auth";
import {
  type CampaignCreativeInput,
  type CampaignCta,
  type CampaignGoal,
  type CampaignPlatform,
  type CreateCampaignPayload,
} from "@/lib/campaigns";
import { validateFile, isVideoUrl } from "@/lib/campaign-shared";
import { CLOUDINARY_FOLDER } from "@/lib/constants";
import { hashFolderName } from "@/lib/encrypt";
import { metaSpecialAdLocations } from "@/lib/meta-special-ad-locations";
import { hydrateSocialAccounts } from "@/lib/social";
import { connectSocialAccount } from "@/lib/oauth";
import type { SocialAccountSetupProps } from "@/types/social";

const goalOptions: Array<{ value: CampaignGoal; label: string }> = [
  { value: "AWARENESS", label: "Awareness" },
  { value: "TRAFFIC", label: "Traffic" },
  { value: "ENGAGEMENT", label: "Engagement" },
  { value: "SALES", label: "Sales" },
  { value: "LEADS", label: "Leads" },
  { value: "APP_PROMOTION", label: "App promotion" },
];

const ctaOptions: Array<{ value: CampaignCta; label: string }> = [
  { value: "LEARN_MORE", label: "Learn more" },
  { value: "SHOP_NOW", label: "Shop now" },
  { value: "SIGN_UP", label: "Sign up" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "BOOK_NOW", label: "Book now" },
  { value: "CONTACT_US", label: "Contact us" },
  { value: "GET_QUOTE", label: "Get quote" },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "APPLY_NOW", label: "Apply now" },
  { value: "NO_BUTTON", label: "No button" },
];

const countries = Object.entries(metaSpecialAdLocations).sort(([, a], [, b]) =>
  a.localeCompare(b),
);

const emptyCreative = (): CampaignCreativeInput => ({
  primaryText: "",
  headline: "",
  cta: "LEARN_MORE",
  mediaUrl: "",
});

const futureIso = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

export const createInitialCampaignPayload = (): CreateCampaignPayload => ({
  creationMode: "manual",
  campaign: {
    name: "",
    goal: "AWARENESS",
    platforms: [],
  },
  audience: {
    locations: ["NG"],
    ageMin: 18,
    ageMax: 65,
    gender: "all",
    interests: [],
  },
  budget: {
    amount: 0,
    currency: "NGN",
    type: "daily",
    startDate: futureIso(30),
  },
  adContent: { creatives: [] },
});

export const validateCampaignPayload = (payload: CreateCampaignPayload) => {
  if (!payload.campaign.name.trim()) return "Enter a campaign name.";
  if (!payload.campaign.platforms.length) return "Select at least one platform.";
  if (!payload.audience.locations.length) return "Select at least one country.";
  if ((payload.audience.ageMin ?? 18) < 18 || (payload.audience.ageMax ?? 65) > 65) {
    return "Audience age must stay between 18 and 65.";
  }
  if ((payload.audience.ageMin ?? 18) > (payload.audience.ageMax ?? 65)) {
    return "Minimum age cannot be greater than maximum age.";
  }
  if (!Number.isFinite(payload.budget.amount) || payload.budget.amount <= 0) {
    return "Enter a budget greater than zero.";
  }
  const start = new Date(payload.budget.startDate);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
    return "Choose a start time in the future.";
  }
  if (payload.budget.endDate) {
    const end = new Date(payload.budget.endDate);
    if (Number.isNaN(end.getTime()) || end <= start) {
      return "End time must be after the start time.";
    }
  }
  if (payload.adContent.creatives.length !== payload.campaign.platforms.length) {
    return "Add one creative for every selected platform.";
  }

  for (let index = 0; index < payload.campaign.platforms.length; index += 1) {
    const platform = payload.campaign.platforms[index];
    const creative = payload.adContent.creatives[index];
    const label = platform === "meta" ? "Meta" : "TikTok";
    if (!creative?.primaryText.trim()) return `Enter primary text for ${label}.`;
    if (!creative.mediaUrl.trim()) return `Upload media for ${label}.`;
    try {
      const mediaUrl = new URL(creative.mediaUrl);
      if (mediaUrl.protocol !== "https:") return `${label} media must use HTTPS.`;
    } catch {
      return `${label} media URL is invalid.`;
    }
    if (platform === "meta") {
      if (isVideoUrl(creative.mediaUrl)) return "Meta currently requires an image creative.";
      if (!creative.landingPageUrl?.trim()) return "Enter a landing page URL for Meta.";
    }
    if (platform === "tiktok" && !isVideoUrl(creative.mediaUrl)) {
      return "TikTok currently requires a video creative.";
    }
    if (payload.campaign.goal === "LEADS" && !creative.leadFormId?.trim()) {
      return `Enter a lead form ID for ${label}.`;
    }
    if (payload.campaign.goal === "APP_PROMOTION" && !creative.appId?.trim()) {
      return `Enter an app ID for ${label}.`;
    }
  }

  return null;
};

const toDateTimeLocal = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

type Props = {
  value: CreateCampaignPayload;
  onChange: (value: CreateCampaignPayload) => void;
  onSubmit: () => void;
  onSecondaryAction?: () => void;
  submitLabel: string;
  secondaryLabel?: string;
  busy?: boolean;
  secondaryBusy?: boolean;
  error?: string | null;
};

export function CampaignForm({
  value,
  onChange,
  onSubmit,
  onSecondaryAction,
  submitLabel,
  secondaryLabel,
  busy = false,
  secondaryBusy = false,
  error,
}: Props) {
  const [connections, setConnections] = useState<SocialAccountSetupProps | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<CampaignPlatform | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void hydrateSocialAccounts().then((result) => {
      if (!active) return;
      if (result.success) setConnections(result.data ?? {});
      else setConnectionError(result.error ?? "Could not load connected accounts.");
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedCountries = useMemo(
    () => new Set(value.audience.locations),
    [value.audience.locations],
  );

  const patch = (next: Partial<CreateCampaignPayload>) =>
    onChange({ ...value, ...next });

  const setPlatform = (platform: CampaignPlatform, selected: boolean) => {
    const currentIndex = value.campaign.platforms.indexOf(platform);
    if (selected && currentIndex === -1) {
      patch({
        campaign: {
          ...value.campaign,
          platforms: [...value.campaign.platforms, platform],
        },
        adContent: {
          creatives: [...value.adContent.creatives, emptyCreative()],
        },
      });
      return;
    }
    if (!selected && currentIndex !== -1) {
      patch({
        campaign: {
          ...value.campaign,
          platforms: value.campaign.platforms.filter((item) => item !== platform),
        },
        adContent: {
          creatives: value.adContent.creatives.filter((_, index) => index !== currentIndex),
        },
      });
    }
  };

  const connectPlatform = async (platform: CampaignPlatform) => {
    setConnectingPlatform(platform);
    setConnectionError(null);

    try {
      const result = await connectSocialAccount(platform);
      if (!result.success) {
        setConnectionError(result.error ?? `Could not connect ${platform}.`);
        return;
      }

      let nextConnections = result.data;
      if (!nextConnections) {
        const refreshed = await hydrateSocialAccounts();
        if (!refreshed.success || !refreshed.data) {
          setConnectionError(refreshed.error ?? "Connected, but could not refresh the account.");
          return;
        }
        nextConnections = refreshed.data;
      }

      const platformConnection = nextConnections[platform];
      if (!platformConnection?.connected || platformConnection.needsReauth) {
        setConnectionError(`Connected, but ${platform} is not ready for campaign publishing.`);
        return;
      }

      setConnections(nextConnections);
    } catch {
      setConnectionError(`Could not connect ${platform}.`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const patchCreative = (index: number, next: Partial<CampaignCreativeInput>) => {
    const creatives = [...value.adContent.creatives];
    creatives[index] = { ...(creatives[index] ?? emptyCreative()), ...next };
    patch({ adContent: { creatives } });
  };

  const uploadMedia = async (index: number, platform: CampaignPlatform, file: File) => {
    const validation = validateFile(file);
    if (!validation.ok) {
      setUploadError(validation.error ?? "Unsupported media file.");
      return;
    }
    if (platform === "meta" && !file.type.startsWith("image/")) {
      setUploadError("Meta currently requires an image file.");
      return;
    }
    if (platform === "tiktok" && !file.type.startsWith("video/")) {
      setUploadError("TikTok currently requires a video file.");
      return;
    }

    setUploadingIndex(index);
    setUploadError(null);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error("Cloudinary is not configured.");

      const encryptedFolder = await hashFolderName();
      const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const publicId = `${encryptedFolder.slice(0, 20)}/${safeName}_${Date.now()}`;
      const signRes = await apiFetch("/media/signature-stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId, folder: CLOUDINARY_FOLDER }),
      });
      const signature = await signRes.json().catch(() => ({}));
      if (!signRes.ok) throw new Error(signature?.message ?? "Could not authorize the upload.");

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", String(signature.api_key));
      body.append("timestamp", String(signature.timestamp));
      body.append("signature", String(signature.signature));
      body.append("public_id", publicId);
      body.append("folder", CLOUDINARY_FOLDER);
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body },
      );
      const uploaded = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok || !uploaded.secure_url) {
        throw new Error(uploaded?.error?.message ?? "Media upload failed.");
      }
      patchCreative(index, { mediaUrl: uploaded.secure_url });
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error ? uploadFailure.message : "Media upload failed.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Campaign setup</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            Campaign name
            <Input
              value={value.campaign.name}
              maxLength={100}
              required
              onChange={(event) =>
                patch({ campaign: { ...value.campaign, name: event.target.value } })
              }
              placeholder="Summer launch"
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Goal
            <select
              className="h-10 w-full rounded-md border bg-white px-3"
              value={value.campaign.goal}
              onChange={(event) =>
                patch({
                  campaign: { ...value.campaign, goal: event.target.value as CampaignGoal },
                })
              }
            >
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Advertising platforms</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(["meta", "tiktok"] as CampaignPlatform[]).map((platform) => {
              const state = connections?.[platform];
              const connected = Boolean(state?.connected && !state?.needsReauth);
              const label = platform === "meta" ? "Meta" : "TikTok";
              return (
                <div key={platform} className="flex items-center justify-between rounded-lg border p-3">
                  <span>
                    <span className="font-medium">{label}</span>
                    <span className={`ml-2 text-xs ${connected ? "text-green-700" : "text-red-600"}`}>
                      {connections ? (connected ? "Connected" : "Not connected") : "Checking…"}
                    </span>
                  </span>
                  {connected ? (
                    <input
                      type="checkbox"
                      checked={value.campaign.platforms.includes(platform)}
                      onChange={(event) => setPlatform(platform, event.target.checked)}
                      aria-label={`Use ${label}`}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={!connections || connectingPlatform !== null}
                      onClick={() => connectPlatform(platform)}
                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {connectingPlatform === platform ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
                        </span>
                      ) : state?.needsReauth ? (
                        `Reconnect ${label}`
                      ) : (
                        `Connect ${label}`
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {connectionError ? (
            <p className="mt-3 text-sm text-red-600">{connectionError}</p>
          ) : connections && !connections.meta?.connected && !connections.tiktok?.connected ? (
            <p className="mt-3 text-sm text-gray-600">
              Connect a platform here to create and publish its ad creative.
            </p>
          ) : null}
        </fieldset>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Audience</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            {value.audience.locations.length ? "Add another country" : "Add country"}
            <select
              className="h-10 w-full rounded-md border bg-white px-3"
              value=""
              onChange={(event) => {
                const code = event.target.value;
                if (code && !selectedCountries.has(code)) {
                  patch({
                    audience: {
                      ...value.audience,
                      locations: [...value.audience.locations, code],
                    },
                  });
                }
              }}
            >
              <option value="">
                {value.audience.locations.length ? "Choose another country" : "Choose a country"}
              </option>
              {countries.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            Gender
            <select
              className="h-10 w-full rounded-md border bg-white px-3"
              value={value.audience.gender ?? "all"}
              onChange={(event) =>
                patch({
                  audience: {
                    ...value.audience,
                    gender: event.target.value as "all" | "male" | "female",
                  },
                })
              }
            >
              <option value="all">All</option>
              <option value="female">Women</option>
              <option value="male">Men</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {value.audience.locations.map((code) => (
            <button
              key={code}
              type="button"
              className="rounded-full bg-gray-100 px-3 py-1 text-sm"
              onClick={() =>
                value.audience.locations.length > 1 &&
                patch({
                  audience: {
                    ...value.audience,
                    locations: value.audience.locations.filter((item) => item !== code),
                  },
                })
              }
            >
              {metaSpecialAdLocations[code as keyof typeof metaSpecialAdLocations] ?? code} ×
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm font-medium">
            Minimum age
            <Input
              type="number"
              min={18}
              max={65}
              value={value.audience.ageMin ?? 18}
              onChange={(event) =>
                patch({ audience: { ...value.audience, ageMin: Number(event.target.value) } })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Maximum age
            <Input
              type="number"
              min={18}
              max={65}
              value={value.audience.ageMax ?? 65}
              onChange={(event) =>
                patch({ audience: { ...value.audience, ageMax: Number(event.target.value) } })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Interests
            <Input
              value={(value.audience.interests ?? []).join(", ")}
              onChange={(event) =>
                patch({
                  audience: {
                    ...value.audience,
                    interests: event.target.value.split(",").map((item) => item.trim()),
                  },
                })
              }
              placeholder="Technology, business"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Budget and schedule</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-1 text-sm font-medium">
            Amount
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={value.budget.amount || ""}
              onChange={(event) =>
                patch({ budget: { ...value.budget, amount: Number(event.target.value) } })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Currency
            <select
              className="h-10 w-full rounded-md border bg-white px-3"
              value={value.budget.currency}
              onChange={(event) =>
                patch({
                  budget: { ...value.budget, currency: event.target.value as "NGN" | "USD" },
                })
              }
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            Budget type
            <select
              className="h-10 w-full rounded-md border bg-white px-3"
              value={value.budget.type}
              onChange={(event) =>
                patch({
                  budget: {
                    ...value.budget,
                    type: event.target.value as "daily" | "lifetime",
                  },
                })
              }
            >
              <option value="daily">Daily</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            Starts (local time)
            <Input
              type="datetime-local"
              value={toDateTimeLocal(value.budget.startDate)}
              onChange={(event) =>
                event.target.value &&
                patch({
                  budget: { ...value.budget, startDate: new Date(event.target.value).toISOString() },
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Ends (optional)
            <Input
              type="datetime-local"
              value={toDateTimeLocal(value.budget.endDate)}
              onChange={(event) =>
                patch({
                  budget: {
                    ...value.budget,
                    endDate: event.target.value
                      ? new Date(event.target.value).toISOString()
                      : undefined,
                  },
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Ad creative</h2>
        {!value.campaign.platforms.length && (
          <p className="mt-3 text-sm text-gray-500">Select a connected platform first.</p>
        )}
        <div className="mt-4 space-y-5">
          {value.campaign.platforms.map((platform, index) => {
            const creative = value.adContent.creatives[index] ?? emptyCreative();
            const label = platform === "meta" ? "Meta image" : "TikTok video";
            return (
              <fieldset key={platform} className="rounded-lg border p-4">
                <legend className="px-2 font-semibold">{label}</legend>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium md:col-span-2">
                    Primary text
                    <textarea
                      className="min-h-24 w-full rounded-md border p-3"
                      maxLength={125}
                      value={creative.primaryText}
                      onChange={(event) => patchCreative(index, { primaryText: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Headline
                    <Input
                      maxLength={40}
                      value={creative.headline ?? ""}
                      onChange={(event) => patchCreative(index, { headline: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Call to action
                    <select
                      className="h-10 w-full rounded-md border bg-white px-3"
                      value={creative.cta}
                      onChange={(event) =>
                        patchCreative(index, { cta: event.target.value as CampaignCta })
                      }
                    >
                      {ctaOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm font-medium md:col-span-2">
                    Landing page URL{platform === "meta" ? " *" : ""}
                    <Input
                      type="url"
                      value={creative.landingPageUrl ?? ""}
                      onChange={(event) =>
                        patchCreative(index, { landingPageUrl: event.target.value || undefined })
                      }
                      placeholder="https://example.com/offer"
                    />
                  </label>
                  {value.campaign.goal === "LEADS" && (
                    <label className="space-y-1 text-sm font-medium md:col-span-2">
                      Lead form ID
                      <Input
                        value={creative.leadFormId ?? ""}
                        onChange={(event) => patchCreative(index, { leadFormId: event.target.value })}
                      />
                    </label>
                  )}
                  {value.campaign.goal === "APP_PROMOTION" && (
                    <label className="space-y-1 text-sm font-medium md:col-span-2">
                      App ID
                      <Input
                        value={creative.appId ?? ""}
                        onChange={(event) => patchCreative(index, { appId: event.target.value })}
                      />
                    </label>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Media URL</label>
                    <Input
                      type="url"
                      value={creative.mediaUrl}
                      onChange={(event) => patchCreative(index, { mediaUrl: event.target.value })}
                      placeholder="https://…"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
                      <UploadCloud className="h-4 w-4" />
                      {uploadingIndex === index ? "Uploading…" : `Upload ${platform === "meta" ? "image" : "video"}`}
                      <input
                        className="hidden"
                        type="file"
                        disabled={uploadingIndex !== null}
                        accept={platform === "meta" ? "image/*" : "video/*"}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadMedia(index, platform, file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {creative.mediaUrl && (
                      isVideoUrl(creative.mediaUrl) ? (
                        <video className="max-h-56 rounded-lg" src={creative.mediaUrl} controls />
                      ) : (
                        <Image
                          className="h-auto max-h-56 w-auto rounded-lg object-contain"
                          src={creative.mediaUrl}
                          alt={`${label} preview`}
                          width={640}
                          height={360}
                          unoptimized
                        />
                      )
                    )}
                  </div>
                </div>
              </fieldset>
            );
          })}
        </div>
        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-3">
        {onSecondaryAction && secondaryLabel && (
          <Button
            type="button"
            variant="outline"
            disabled={busy || secondaryBusy || uploadingIndex !== null}
            onClick={onSecondaryAction}
          >
            {secondaryBusy ? "Saving…" : secondaryLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={busy || secondaryBusy || uploadingIndex !== null}
          className="bg-khaki-200 text-black hover:bg-khaki-300"
        >
          {busy ? "Working…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
