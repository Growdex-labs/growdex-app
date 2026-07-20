"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Film,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { isVideoUrl } from "@/lib/campaign-shared";
import type {
  CampaignCreativeInput,
  CampaignCta,
  CampaignDestination,
  CampaignGoal,
  CampaignPlatform,
  MetaLeadForm,
} from "@/lib/campaigns";

interface CreativeAdEditorProps {
  goal: CampaignGoal;
  destination: CampaignDestination;
  creatives: CampaignCreativeInput[];
  ctaOptions: Array<{ value: CampaignCta; label: string }>;
  uploading: number | null;
  activeIndex: number;
  leadForms: MetaLeadForm[];
  leadFormsLoading: boolean;
  leadFormsError: string | null;
  onActiveIndexChange: (index: number) => void;
  onBack: () => void;
  onChange: (index: number, next: Partial<CampaignCreativeInput>) => void;
  onRemove: (index: number) => void;
  onUpload: (index: number, platform: CampaignPlatform, file: File) => void;
}

const platformName = (platform: CampaignPlatform) =>
  platform === "meta" ? "Meta" : "TikTok";

function CreativePreview({ creative }: { creative: CampaignCreativeInput }) {
  const isMeta = creative.platform === "meta";

  return (
    <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-xs font-gilroy-semibold uppercase tracking-[0.12em] text-gray-400">
            Live preview
          </p>
          <p className="mt-0.5 text-sm font-gilroy-semibold text-gray-900">
            {isMeta ? "Meta feed" : "TikTok in-feed"}
          </p>
        </div>
        <span className="rounded-full bg-dimYellow px-2.5 py-1 text-[11px] font-gilroy-semibold text-gray-700">
          {isMeta ? "Image" : "Video"}
        </span>
      </div>

      <div className={isMeta ? "p-4" : "bg-[#151515] p-5"}>
        <div
          className={
            isMeta
              ? "overflow-hidden rounded-xl border border-gray-200 bg-white"
              : "mx-auto max-w-[260px] overflow-hidden rounded-[28px] border-[6px] border-gray-950 bg-gray-950 shadow-xl"
          }
        >
          <div className={`flex items-center gap-2 ${isMeta ? "p-3" : "bg-white p-3"}`}>
            <span className="flex size-8 items-center justify-center rounded-full bg-khaki-200 text-xs font-gilroy-bold text-black-800">
              G
            </span>
            <span>
              <span className="block text-xs font-gilroy-semibold text-gray-900">Your brand</span>
              <span className="block text-[10px] text-gray-400">Sponsored</span>
            </span>
          </div>
          <p className={`text-sm leading-5 text-gray-700 ${isMeta ? "px-3 pb-3" : "bg-white px-3 pb-3"}`}>
            {creative.primaryText || "Your primary text will appear here."}
          </p>
          {creative.mediaUrl ? (
            isVideoUrl(creative.mediaUrl) ? (
              <video
                className={isMeta ? "aspect-video w-full bg-gray-100 object-cover" : "aspect-9/16 w-full bg-gray-900 object-cover"}
                src={creative.mediaUrl}
                controls
              />
            ) : (
              <Image
                className={isMeta ? "aspect-video w-full bg-gray-100 object-cover" : "aspect-9/16 w-full bg-gray-900 object-cover"}
                src={creative.mediaUrl}
                alt={`${platformName(creative.platform)} creative preview`}
                width={640}
                height={isMeta ? 360 : 1138}
                unoptimized
              />
            )
          ) : (
            <div className={`flex items-center justify-center bg-gray-100 text-center text-xs text-gray-400 ${isMeta ? "aspect-video" : "aspect-9/16"}`}>
              Upload {isMeta ? "an image" : "a video"} to preview it
            </div>
          )}
          <div className="flex items-center justify-between gap-3 bg-white p-3">
            <p className="min-w-0 truncate text-sm font-gilroy-semibold text-gray-900">
              {creative.headline || "Ad headline"}
            </p>
            <span className="shrink-0 rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-gilroy-semibold text-gray-600">
              {creative.cta.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function CreativeAdEditor({
  goal,
  destination,
  creatives,
  ctaOptions,
  uploading,
  activeIndex,
  leadForms,
  leadFormsLoading,
  leadFormsError,
  onActiveIndexChange,
  onBack,
  onChange,
  onRemove,
  onUpload,
}: CreativeAdEditorProps) {
  const creative = creatives[activeIndex];

  if (!creative) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        The selected creative is no longer available. Return to the asset library and choose it again.
        <button type="button" onClick={onBack} className="mt-4 block font-gilroy-semibold underline">
          Back to asset library
        </button>
      </div>
    );
  }

  const platform = creative.platform;
  const samePlatformCount = creatives.filter((item) => item.platform === platform).length;
  const canRemove = samePlatformCount > 1;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-[#fafafa] shadow-sm">
      <header className="border-b border-gray-200 bg-white p-5 md:px-8 md:py-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-gilroy-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="size-4" /> Back to asset library
        </button>
        <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-gilroy-semibold uppercase tracking-[0.14em] text-violet-500">
              Creative setup
            </p>
            <h2 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
              Setup your {platformName(platform)} ad
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Add the copy and destination details, then confirm the live platform preview.
            </p>
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(activeIndex)}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 px-3 py-2 text-sm font-gilroy-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" /> Remove creative
            </button>
          )}
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {creatives.map((item, index) => {
            const ordinal = creatives.slice(0, index + 1).filter((candidate) => candidate.platform === item.platform).length;
            const count = creatives.filter((candidate) => candidate.platform === item.platform).length;
            const active = index === activeIndex;
            const Icon = item.platform === "meta" ? ImageIcon : Film;
            return (
              <button
                key={`${item.platform}-${index}-${item.mediaUrl}`}
                type="button"
                onClick={() => onActiveIndexChange(index)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-gilroy-semibold transition-colors ${
                  active
                    ? "border-khaki-300 bg-dimYellow text-gray-950"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <Icon className="size-4" />
                {platformName(item.platform)} ad{count > 1 ? ` ${ordinal}` : ""}
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid gap-6 p-5 md:p-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <fieldset className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <legend className="sr-only">{platformName(platform)} ad details</legend>
          <label className="block text-sm font-gilroy-semibold text-gray-700">
            Primary text
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-gray-200 bg-white p-3 font-gilroy-regular outline-none transition focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
              maxLength={125}
              value={creative.primaryText}
              onChange={(event) => onChange(activeIndex, { primaryText: event.target.value })}
              placeholder="Tell people why this offer matters"
            />
            <span className="mt-1 block text-right text-xs font-gilroy-regular text-gray-400">
              {creative.primaryText.length}/125
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-gilroy-semibold text-gray-700">
              Headline
              <Input
                className="mt-2 h-11 rounded-xl border-gray-200"
                maxLength={40}
                value={creative.headline ?? ""}
                onChange={(event) => onChange(activeIndex, { headline: event.target.value })}
                placeholder="Add a clear headline"
              />
            </label>
            <label className="text-sm font-gilroy-semibold text-gray-700">
              Call to action
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 font-gilroy-regular text-sm"
                value={creative.cta}
                onChange={(event) => onChange(activeIndex, { cta: event.target.value as CampaignCta })}
              >
                {ctaOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          {destination !== "INSTANT_FORM" && (
            <label className="block text-sm font-gilroy-semibold text-gray-700">
              Landing page URL *
              <Input
                className="mt-2 h-11 rounded-xl border-gray-200"
                type="url"
                value={creative.landingPageUrl ?? ""}
                onChange={(event) => onChange(activeIndex, { landingPageUrl: event.target.value || undefined })}
                placeholder="https://example.com/offer"
              />
            </label>
          )}

          {platform === "meta" && destination === "INSTANT_FORM" && (
            <label className="block text-sm font-gilroy-semibold text-gray-700">
              Meta Instant Form *
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 font-gilroy-regular text-sm"
                value={creative.leadFormId ?? ""}
                disabled={leadFormsLoading || Boolean(leadFormsError)}
                onChange={(event) => onChange(activeIndex, { leadFormId: event.target.value || undefined })}
              >
                <option value="">
                  {leadFormsLoading ? "Loading forms from Meta…" : leadForms.length ? "Choose an active form" : "No forms available"}
                </option>
                {leadForms.map((form) => (
                  <option key={form.id} value={form.id} disabled={form.status !== "ACTIVE"}>
                    {form.name}{form.locale ? ` · ${form.locale}` : ""}{form.status !== "ACTIVE" ? ` · ${form.status.toLowerCase()}` : ""}
                  </option>
                ))}
              </select>
              {leadFormsError && <span className="mt-2 block text-xs text-red-600">{leadFormsError}</span>}
              {!leadFormsLoading && !leadFormsError && leadForms.length === 0 && (
                <span className="mt-2 block text-xs text-amber-700">
                  Create and publish an Instant Form on the selected Meta Page before continuing.
                </span>
              )}
            </label>
          )}

          {goal === "APP_PROMOTION" && (
            <label className="block text-sm font-gilroy-semibold text-gray-700">
              App ID
              <Input
                className="mt-2 h-11 rounded-xl border-gray-200"
                value={creative.appId ?? ""}
                onChange={(event) => onChange(activeIndex, { appId: event.target.value })}
              />
            </label>
          )}

          <label className="block text-sm font-gilroy-semibold text-gray-700">
            Hosted media URL
            <Input
              className="mt-2 h-11 rounded-xl border-gray-200"
              type="url"
              value={creative.mediaUrl}
              onChange={(event) => onChange(activeIndex, { mediaUrl: event.target.value })}
              placeholder="https://res.cloudinary.com/…"
            />
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-700 transition-colors hover:bg-gray-50">
            {uploading === activeIndex ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {uploading === activeIndex ? "Uploading…" : `Replace ${platform === "meta" ? "image" : "video"}`}
            <input
              className="hidden"
              type="file"
              disabled={uploading !== null}
              accept={platform === "meta" ? "image/*" : "video/*"}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(activeIndex, platform, file);
                event.target.value = "";
              }}
            />
          </label>
        </fieldset>

        <CreativePreview creative={creative} />
      </div>
    </section>
  );
}

export default CreativeAdEditor;
