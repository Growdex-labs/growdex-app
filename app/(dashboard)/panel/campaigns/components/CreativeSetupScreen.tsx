"use client";

import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isVideoUrl } from "@/lib/campaign-shared";
import type {
  CampaignCreativeInput,
  CampaignCta,
  CampaignGoal,
  CampaignPlatform,
} from "@/lib/campaigns";

interface CreativeSetupScreenProps {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  creatives: CampaignCreativeInput[];
  ctaOptions: Array<{ value: CampaignCta; label: string }>;
  uploading: number | null;
  onChange: (index: number, next: Partial<CampaignCreativeInput>) => void;
  onUpload: (index: number, platform: CampaignPlatform, file: File) => void;
}

export function CreativeSetupScreen({
  goal,
  platforms,
  creatives,
  ctaOptions,
  uploading,
  onChange,
  onUpload,
}: CreativeSetupScreenProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 p-6 md:px-8">
        <h2 className="text-xl font-bold text-gray-900">Setup your ad creatives</h2>
        <p className="mt-2 text-sm text-gray-500">Upload real media, edit the copy, and check the platform preview before continuing.</p>
      </header>

      <div className="space-y-8 p-6 md:p-8">
        {platforms.map((platform, index) => {
          const creative = creatives[index];
          if (!creative) return null;
          return (
            <fieldset key={platform} className="grid gap-6 rounded-2xl border border-gray-200 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <legend className="font-semibold text-gray-900">{platform === "meta" ? "Meta image ad" : "TikTok video ad"}</legend>
                <label className="block text-sm font-medium text-gray-700">Primary text<textarea className="mt-2 min-h-24 w-full rounded-lg border p-3" maxLength={125} value={creative.primaryText} onChange={(event) => onChange(index, { primaryText: event.target.value })} /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">Headline<Input className="mt-2" maxLength={40} value={creative.headline ?? ""} onChange={(event) => onChange(index, { headline: event.target.value })} /></label>
                  <label className="text-sm font-medium text-gray-700">Call to action<select className="mt-2 h-10 w-full rounded-md border bg-white px-3" value={creative.cta} onChange={(event) => onChange(index, { cta: event.target.value as CampaignCta })}>{ctaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                </div>
                <label className="block text-sm font-medium text-gray-700">Landing page URL{platform === "meta" ? " *" : ""}<Input className="mt-2" type="url" value={creative.landingPageUrl ?? ""} onChange={(event) => onChange(index, { landingPageUrl: event.target.value || undefined })} placeholder="https://example.com/offer" /></label>
                {goal === "LEADS" && <label className="block text-sm font-medium text-gray-700">Lead form ID<Input className="mt-2" value={creative.leadFormId ?? ""} onChange={(event) => onChange(index, { leadFormId: event.target.value })} /></label>}
                {goal === "APP_PROMOTION" && <label className="block text-sm font-medium text-gray-700">App ID<Input className="mt-2" value={creative.appId ?? ""} onChange={(event) => onChange(index, { appId: event.target.value })} /></label>}
                <label className="block text-sm font-medium text-gray-700">Hosted media URL<Input className="mt-2" type="url" value={creative.mediaUrl} onChange={(event) => onChange(index, { mediaUrl: event.target.value })} placeholder="https://res.cloudinary.com/…" /></label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {uploading === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploading === index ? "Uploading…" : `Upload ${platform === "meta" ? "image" : "video"}`}
                  <input className="hidden" type="file" disabled={uploading !== null} accept={platform === "meta" ? "image/*" : "video/*"} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(index, platform, file); event.target.value = ""; }} />
                </label>
              </div>

              <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Live {platform} preview</p>
                  <p className="mt-3 text-sm text-gray-700">{creative.primaryText || "Your primary text will appear here."}</p>
                </div>
                {creative.mediaUrl ? (
                  isVideoUrl(creative.mediaUrl) ? <video className="aspect-video w-full bg-gray-100 object-cover" src={creative.mediaUrl} controls /> : <Image className="aspect-video w-full bg-gray-100 object-cover" src={creative.mediaUrl} alt={`${platform} creative preview`} width={640} height={360} unoptimized />
                ) : (
                  <div className="flex aspect-video items-center justify-center border-y border-gray-200 bg-white text-xs text-gray-400">Upload {platform === "meta" ? "an image" : "a video"} to preview it</div>
                )}
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="truncate text-sm font-semibold text-gray-900">{creative.headline || "Ad headline"}</p>
                  <span className="shrink-0 rounded-md border bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">{creative.cta.replaceAll("_", " ")}</span>
                </div>
              </aside>
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}

export default CreativeSetupScreen;
