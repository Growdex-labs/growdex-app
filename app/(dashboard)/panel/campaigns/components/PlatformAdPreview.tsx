"use client";

import Image from "next/image";
import {
  Bookmark,
  Heart,
  Home,
  Inbox,
  MoreHorizontal,
  MessageCircle,
  Music2,
  Plus,
  Search,
  Share2,
  ThumbsUp,
  UserRound,
  Users,
} from "lucide-react";
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
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
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
  const destination = creative.landingPageUrl
    ? creative.landingPageUrl.replace(/^https?:\/\//, "").split("/")[0]
    : "yourbrand.com";

  return (
    <div className="bg-[#eef1f5] px-4 py-5 sm:px-6">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl bg-white shadow-[0_10px_35px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
        <div className="flex items-center gap-3 px-4 pb-3 pt-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#111827] text-sm font-gilroy-bold text-white ring-2 ring-white shadow-sm">
            {brandName.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-gilroy-bold text-[#182230]">
              {brandName}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#667085]">
              Sponsored · Public
            </span>
          </span>
          <MoreHorizontal className="size-5 text-[#667085]" />
        </div>

        <p className="line-clamp-3 px-4 pb-3 text-[13px] leading-[1.45] text-[#344054]">
          {creative.primaryText || "Your primary text will appear here."}
        </p>

        <PreviewMedia
          creative={creative}
          className="aspect-[4/5] max-h-[430px] w-full bg-[#e4e7ec] object-cover"
        />

        <div className="flex items-center justify-between gap-3 bg-[#f8f9fb] px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] uppercase tracking-[0.08em] text-[#667085]">
              {destination}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[13px] font-gilroy-bold leading-4 text-[#182230]">
              {creative.headline || "Discover more from this brand"}
            </p>
          </div>
          <span className="max-w-[120px] shrink-0 truncate rounded-md border border-[#d0d5dd] bg-white px-3 py-2 text-[10px] font-gilroy-bold text-[#344054] shadow-sm">
            {ctaLabel(creative)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[#eaecf0] px-4 py-2 text-[#667085]">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-gilroy-semibold">
            <ThumbsUp className="size-4" /> Like
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-gilroy-semibold">
            <MessageCircle className="size-4" /> Comment
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-gilroy-semibold">
            <Share2 className="size-4" /> Share
          </span>
        </div>
      </div>
    </div>
  );
}

function TikTokAdPreview({
  creative,
  brandName,
}: Required<PlatformAdPreviewProps>) {
  const username = brandName.replaceAll(" ", "").toLowerCase();

  return (
    <div className="bg-[#f5f5f5] px-4 py-6 sm:px-6">
      <div className="relative mx-auto aspect-[9/18.6] w-full max-w-[280px] overflow-hidden rounded-[32px] border-[6px] border-[#111] bg-[#080808] shadow-[0_24px_56px_rgba(15,23,42,0.24),inset_0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-black/30">
        <PreviewMedia
          creative={creative}
          className="absolute inset-0 h-full w-full bg-gray-950 object-cover text-gray-300"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,transparent_18%,transparent_50%,rgba(0,0,0,0.86)_100%)]" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-center px-5 pb-8 pt-5 text-white">
          <span className="absolute left-5 top-4 text-center text-[8px] font-gilroy-bold leading-[0.9] drop-shadow-md">
            <span className="block text-[11px]">⌁</span>LIVE
          </span>
          <div className="flex items-center gap-5 text-[12px] font-gilroy-semibold drop-shadow-md">
            <span className="text-white/70">Following</span>
            <span className="relative text-white after:absolute after:-bottom-1.5 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-white">
              For You
            </span>
          </div>
          <Search className="absolute right-5 top-4 size-5 drop-shadow-md" />
        </div>

        <div className="absolute bottom-[70px] right-3 flex flex-col items-center gap-2.5 text-white drop-shadow-lg">
          <span className="relative mb-1 flex size-9 items-center justify-center rounded-full border-2 border-white bg-[#151515] text-xs font-gilroy-bold shadow-md">
            {brandName.slice(0, 1).toUpperCase()}
            <span className="absolute -bottom-2 flex size-4 items-center justify-center rounded-full bg-[#fe2c55] text-[12px] leading-none text-white">
              +
            </span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <Heart className="size-5 fill-white stroke-[1.5]" />
            <span className="text-[8px] font-gilroy-semibold">99.1K</span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <MessageCircle className="size-5 fill-white stroke-[1.5] text-white" />
            <span className="text-[8px] font-gilroy-semibold">3,456</span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <Bookmark className="size-5 fill-white stroke-[1.5]" />
            <span className="text-[8px] font-gilroy-semibold">1,256</span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <Share2 className="size-5 fill-white stroke-[1.5]" />
            <span className="text-[8px] font-gilroy-semibold">1,256</span>
          </span>
          <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,#555_0_25%,#111_27%_100%)] ring-1 ring-white/20">
            <Music2 className="size-3" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-[58px] p-4 pr-[70px] text-white drop-shadow-md">
          <p className="text-[12px] font-gilroy-bold">
            @{username} <span className="ml-1 text-[9px] font-gilroy-semibold text-white/70">Sponsored</span>
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-[1.45] text-white/95">
            {creative.primaryText || "Your caption will appear here."}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/90">
            <Music2 className="size-3" />
            <span className="truncate">Promoted sound · {brandName}</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 grid h-[58px] grid-cols-5 items-center border-t border-white/15 bg-black px-2 text-white">
          {[
            { label: "Home", Icon: Home, active: true },
            { label: "Friends", Icon: Users },
            { label: "Create", Icon: Plus, create: true },
            { label: "Inbox", Icon: Inbox },
            { label: "Profile", Icon: UserRound },
          ].map(({ label, Icon, active, create }) => (
            <span key={label} className="flex flex-col items-center gap-0.5 text-[8px] font-gilroy-semibold">
              <span className={create ? "flex h-7 w-10 items-center justify-center rounded-lg bg-[linear-gradient(90deg,#25f4ee_0_18%,white_18%_82%,#fe2c55_82%)] text-black" : ""}>
                <Icon className={`size-4 ${active ? "fill-white" : ""}`} />
              </span>
              <span>{label}</span>
            </span>
          ))}
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
