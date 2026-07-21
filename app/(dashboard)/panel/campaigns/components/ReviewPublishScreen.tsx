"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  type CampaignReviewPayload,
  validateCampaignPayload,
} from "@/lib/campaigns";
import { metaSpecialAdLocations } from "@/lib/meta-special-ad-locations";
import type { SocialAccountSetupProps } from "@/types/social";
import { PlatformAdPreview } from "./PlatformAdPreview";

interface ReviewPublishScreenProps {
  stepper?: ReactNode;
  campaign: CampaignReviewPayload;
  brandName?: string;
  accounts?: SocialAccountSetupProps | null;
  accountsLoading?: boolean;
  accountsError?: string | null;
  onPublish: () => void;
  onSaveDraft?: () => void;
  onBack?: () => void;
  publishing?: boolean;
  saving?: boolean;
  error?: string | null;
  publishLabel?: string;
}

const goalLabels: Record<CampaignReviewPayload["campaign"]["goal"], string> = {
  AWARENESS: "Awareness",
  TRAFFIC: "Traffic",
  ENGAGEMENT: "Engagement",
  SALES: "Sales",
  LEADS: "Lead generation",
  APP_PROMOTION: "App promotion",
};

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "No end date";

export function ReviewPublishScreen({
  stepper,
  campaign,
  brandName = "Your brand",
  accounts,
  accountsLoading = false,
  accountsError,
  onPublish,
  onSaveDraft,
  onBack,
  publishing = false,
  saving = false,
  error,
  publishLabel = "Publish ad",
}: ReviewPublishScreenProps) {
  const validationError = validateCampaignPayload(campaign);
  const busy = publishing || saving;
  const accountName = (
    platform: CampaignReviewPayload["campaign"]["platforms"][number],
  ) => {
    const assetId = campaign.campaign.configuration.accountAssetIds?.[platform];
    if (platform === "meta") {
      return accounts?.meta?.assets?.find((asset) => asset.id === assetId)
        ?.adAccountName;
    }
    return accounts?.tiktok?.assets?.find((asset) => asset.id === assetId)?.name;
  };

  return (
    <>
      {stepper && <div className="mb-8">{stepper}</div>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review and publish</h1>
          <p className="mt-1 text-sm text-gray-500">
            This is the exact campaign Growdex will save and send to your ad platforms.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" /> Edit campaign
            </button>
          )}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={busy || Boolean(validationError)}
            className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {publishing ? "Publishing…" : publishLabel}
          </button>
        </div>
      </div>

      {(error || validationError) && (
        <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error ?? validationError}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {campaign.campaign.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-khaki-200 px-3 py-1 font-medium text-gray-800">
                {goalLabels[campaign.campaign.goal]}
              </span>
              {campaign.campaign.platforms.map((platform) => (
                <span key={platform} className="rounded-full bg-gray-100 px-3 py-1 capitalize text-gray-700">
                  {platform}
                </span>
              ))}
              <span className="rounded-full bg-violet-50 px-3 py-1 capitalize text-violet-700">
                {campaign.creationMode} setup
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            {campaign.adContent.creatives.map((creative, index) => {
              const platform = creative.platform;
              return (
                <article
                  key={`${platform}-${index}-${creative.mediaUrl}`}
                  className="self-start overflow-hidden rounded-2xl"
                >
                  <PlatformAdPreview
                    creative={creative}
                    brandName={brandName}
                  />
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Delivery settings</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-400">Ad set</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {campaign.campaign.configuration.adSetName || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Destination and optimization</dt>
                <dd className="mt-1 text-gray-700">
                  {campaign.campaign.configuration.destination.replaceAll("_", " ")} · {campaign.campaign.configuration.optimizationGoal.replaceAll("_", " ")}
                </dd>
              </div>
              {campaign.campaign.platforms.map((platform) => (
                <div key={platform}>
                  <dt className="capitalize text-gray-400">{platform} account</dt>
                  <dd className="mt-1 text-gray-700">
                    {accountsLoading
                      ? "Loading connected account…"
                      : accountName(platform) ??
                        accountsError ??
                        "Connected account not found"}
                    {campaign.campaign.configuration.eventSourceIds?.[platform]
                      ? ` · Pixel ${campaign.campaign.configuration.eventSourceIds[platform]}`
                      : ""}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Audience</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-400">Locations</dt>
                <dd className="mt-1 text-gray-700">
                  {campaign.audience.locations.map((code) =>
                    metaSpecialAdLocations[code as keyof typeof metaSpecialAdLocations] ?? code,
                  ).join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Age and gender</dt>
                <dd className="mt-1 capitalize text-gray-700">
                  {campaign.audience.ageMin}–{campaign.audience.ageMax}, {campaign.audience.gender}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Interests</dt>
                <dd className="mt-1 text-gray-700">
                  {campaign.audience.interests?.filter(Boolean).join(", ") || "Broad audience"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Languages and devices</dt>
                <dd className="mt-1 capitalize text-gray-700">
                  {campaign.audience.languages?.join(", ") || "All languages"} · {(campaign.audience.devices ?? ["mobile"]).join(", ")}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Budget and schedule</h3>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: campaign.budget.currency,
                maximumFractionDigits: 2,
              }).format(campaign.budget.amount)}
              <span className="ml-1 text-sm font-normal text-gray-400">/{campaign.budget.type}</span>
            </p>
            <p className="mt-3 text-sm text-gray-600">Starts {formatDate(campaign.budget.startDate)}</p>
            <p className="mt-1 text-sm text-gray-600">Ends {formatDate(campaign.budget.endDate)}</p>
          </section>
        </aside>
      </div>
    </>
  );
}

export default ReviewPublishScreen;
