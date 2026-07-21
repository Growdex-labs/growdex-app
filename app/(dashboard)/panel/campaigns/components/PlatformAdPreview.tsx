"use client";

import Image from "next/image";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { isVideoUrl } from "@/lib/campaign-shared";
import type { CampaignCreativeInput } from "@/lib/campaigns";

interface PlatformAdPreviewProps {
  creative: CampaignCreativeInput;
  brandName?: string;
}

const ctaLabel = (creative: CampaignCreativeInput) =>
  creative.cta.replaceAll("_", " ");

function PreviewMedia({
  creative,
  className,
}: {
  creative: CampaignCreativeInput;
  className: string;
}) {
  if (!creative.mediaUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 px-5 text-center text-xs text-gray-400 ${className}`}
      >
        Upload {creative.platform === "meta" ? "an image" : "a video"} to
        preview it
      </div>
    );
  }

  if (isVideoUrl(creative.mediaUrl)) {
    return (
      <video
        className={className}
        src={creative.mediaUrl}
        controls
        playsInline
      />
    );
  }

  return (
    <Image
      className={className}
      src={creative.mediaUrl}
      alt={`${creative.platform === "meta" ? "Meta" : "TikTok"} creative preview`}
      width={640}
      height={creative.platform === "meta" ? 360 : 1138}
      unoptimized
    />
  );
}

function MetaAdPreview({
  creative,
  brandName,
}: Required<PlatformAdPreviewProps>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 p-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-gray-950 text-xs font-gilroy-bold text-white">
          {brandName.slice(0, 1).toUpperCase()}
        </span>
        <span>
          <span className="block text-xs font-gilroy-semibold text-gray-900">
            {brandName}
          </span>
          <span className="block text-[10px] text-gray-400">Sponsored on Meta</span>
        </span>
      </div>
      <p className="px-3 pb-3 text-sm leading-5 text-gray-700">
        {creative.primaryText || "Your primary text will appear here."}
      </p>
      <PreviewMedia
        creative={creative}
        className="aspect-video w-full bg-gray-100 object-cover"
      />
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-gilroy-semibold text-gray-900">
            {creative.headline || "Ad headline"}
          </p>
          {creative.landingPageUrl && (
            <p className="truncate text-xs text-gray-400">
              {creative.landingPageUrl}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-gilroy-semibold text-gray-600">
          {ctaLabel(creative)}
        </span>
      </div>
    </div>
  );
}

function TikTokAdPreview({
  creative,
  brandName,
}: Required<PlatformAdPreviewProps>) {
  return (
    <div className="bg-[#151515] p-4">
      <div className="relative mx-auto aspect-9/16 max-w-[280px] overflow-hidden rounded-[28px] border-[6px] border-black bg-gray-950 shadow-xl">
        <PreviewMedia
          creative={creative}
          className="absolute inset-0 h-full w-full bg-gray-950 object-cover text-gray-300"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />

        <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4 text-white">
          <span className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-gray-950 text-sm font-gilroy-bold">
            {brandName.slice(0, 1).toUpperCase()}
          </span>
          <span className="flex flex-col items-center gap-1">
            <Heart className="size-6 fill-white" />
            <span className="text-[9px]">Like</span>
          </span>
          <span className="flex flex-col items-center gap-1">
            <MessageCircle className="size-6 fill-white" />
            <span className="text-[9px]">Comment</span>
          </span>
          <span className="flex flex-col items-center gap-1">
            <Share2 className="size-6 fill-white" />
            <span className="text-[9px]">Share</span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 pr-14 text-white">
          <p className="text-xs font-gilroy-bold">@{brandName.replaceAll(" ", "").toLowerCase()}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4">
            {creative.primaryText || "Your caption will appear here."}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/20 pt-2">
            <p className="min-w-0 truncate text-[10px] font-gilroy-semibold">
              Sponsored · {creative.headline || "Ad headline"}
            </p>
            <span className="shrink-0 rounded bg-white px-2 py-1 text-[9px] font-gilroy-bold text-gray-950">
              {ctaLabel(creative)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformAdPreview({
  creative,
  brandName = "Your brand",
}: PlatformAdPreviewProps) {
  return creative.platform === "meta" ? (
    <MetaAdPreview creative={creative} brandName={brandName} />
  ) : (
    <TikTokAdPreview creative={creative} brandName={brandName} />
  );
}

export default PlatformAdPreview;
