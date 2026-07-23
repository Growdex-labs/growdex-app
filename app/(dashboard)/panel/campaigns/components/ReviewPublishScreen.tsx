"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Languages,
  Loader2,
  MapPin,
  Smartphone,
  Target,
  Users,
} from "lucide-react";
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

      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 text-white shadow-sm">
          <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)] md:p-8">
            <div>
              <p className="text-xs font-gilroy-semibold uppercase tracking-[0.16em] text-khaki-200">
                Campaign brief
              </p>
              <h2 className="mt-2 text-2xl font-gilroy-bold">
                {campaign.campaign.name}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-khaki-200 px-3 py-1.5 font-gilroy-semibold text-gray-950">
                  {goalLabels[campaign.campaign.goal]}
                </span>
                {campaign.campaign.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 capitalize text-white/80"
                  >
                    {platform}
                  </span>
                ))}
                <span className="rounded-full border border-violet-300/20 bg-violet-400/15 px-3 py-1.5 capitalize text-violet-100">
                  {campaign.creationMode} setup
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-gilroy-semibold uppercase tracking-[0.14em] text-white/45">
                Delivery accounts
              </p>
              <dl className="mt-3 space-y-3 text-sm">
                {campaign.campaign.platforms.map((platform) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="capitalize text-white/50">{platform}</dt>
                    <dd className="truncate text-right font-gilroy-semibold text-white">
                      {accountsLoading
                        ? "Loading…"
                        : accountName(platform) ??
                          accountsError ??
                          "Account not found"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {campaign.audienceStrategies.map((strategy, strategyIndex) => {
          const locations = strategy.audience.locations
            .map(
              (code) =>
                metaSpecialAdLocations[
                  code as keyof typeof metaSpecialAdLocations
                ] ?? code,
            )
            .join(", ");
          const summaryItems = [
            {
              label: "Locations",
              value: locations || "No locations selected",
              Icon: MapPin,
            },
            {
              label: "People",
              value: `${strategy.audience.ageMin ?? 18}–${strategy.audience.ageMax ?? 65}, ${strategy.audience.gender ?? "all"}`,
              Icon: Users,
            },
            {
              label: "Interests",
              value:
                strategy.audience.interests?.filter(Boolean).join(", ") ||
                "Broad audience",
              Icon: Target,
            },
            {
              label: "Language",
              value:
                strategy.audience.languages?.join(", ") || "All languages",
              Icon: Languages,
            },
            {
              label: "Devices",
              value: (strategy.audience.devices ?? ["mobile"]).join(", "),
              Icon: Smartphone,
            },
          ];

          return (
            <section
              key={strategy.id}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <header className="flex flex-col justify-between gap-4 border-b border-gray-100 bg-[#fbfbf8] p-6 md:flex-row md:items-end md:px-8">
                <div>
                  <p className="text-xs font-gilroy-semibold uppercase tracking-[0.16em] text-violet-500">
                    Audience strategy {strategyIndex + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-gilroy-bold text-gray-950">
                    {strategy.name}
                  </h3>
                  <p className="mt-1 text-sm capitalize text-gray-500">
                    {strategy.configuration.destination.replaceAll("_", " ")}
                    {" · "}
                    {strategy.configuration.optimizationGoal
                      .replaceAll("_", " ")
                      .toLowerCase()}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-950 px-5 py-3 text-white">
                  <p className="flex items-center gap-2 text-xs text-white/50">
                    <Banknote className="size-3.5" /> Budget
                  </p>
                  <p className="mt-1 text-xl font-gilroy-bold">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: strategy.budget.currency,
                      maximumFractionDigits: 2,
                    }).format(strategy.budget.amount)}
                    <span className="ml-1 text-xs font-gilroy-regular text-white/50">
                      /{strategy.budget.type}
                    </span>
                  </p>
                </div>
              </header>

              <div className="p-6 md:p-8">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {summaryItems.map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <Icon className="size-4 text-violet-500" />
                      <p className="mt-3 text-xs font-gilroy-semibold uppercase tracking-[0.1em] text-gray-400">
                        {label}
                      </p>
                      <p className="mt-1 text-sm capitalize leading-5 text-gray-800">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-gray-100 px-4 py-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-gray-400" />
                    Starts {formatDate(strategy.budget.startDate)}
                  </span>
                  <span>Ends {formatDate(strategy.budget.endDate)}</span>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-gilroy-semibold uppercase tracking-[0.14em] text-gray-400">
                    Ads in this strategy
                  </p>
                  <div className="mt-4 flex flex-wrap items-start gap-5">
                    {strategy.ads.map((creative, index) => (
                      <article
                        key={`${strategy.id}-${creative.platform}-${index}-${creative.mediaUrl}`}
                        className={`w-full flex-none self-start overflow-hidden rounded-2xl border border-gray-100 ${
                          creative.platform === "meta"
                            ? "max-w-[30rem]"
                            : "max-w-[22rem]"
                        }`}
                      >
                        <PlatformAdPreview
                          creative={creative}
                          brandName={brandName}
                        />
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default ReviewPublishScreen;
