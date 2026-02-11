"use client";

import React from "react";
import { MetaAdPreview } from "./preview/meta-ad-preview";
import { TikTokAdPreview } from "./preview/tiktok-ad-preview";
import { useMe } from "@/context/me-context";

interface AdPreviewSectionProps {
  activePlatform: "meta" | "tiktok";
  headline: string;
  caption: string;
  creative: { type: "image" | "video"; url: string } | null;
  callToAction: string;
}

export default function AdPreviewSection({
  activePlatform = "meta",
  headline = "",
  caption = "",
  creative = null,
  callToAction = "Learn More",
}: AdPreviewSectionProps) {
  const { me } = useMe();
  const brandName = me?.brand?.name ?? "";
  const fallbackBrand = "Your Brand";
  const safeBrandName = brandName || fallbackBrand;
  const username = `@${safeBrandName}`.replace(/\s+/g, "");

  if (activePlatform === "meta") {
    return (
      <MetaAdPreview
        brandName={safeBrandName}
        brandLogo="/logo.png"
        caption={caption}
        creative={creative}
        headline={headline}
        callToAction={callToAction}
      />
    );
  }

  return (
    <TikTokAdPreview
      username={username}
      caption={caption}
      creative={creative}
      profilePic="/logo.png"
    />
  );
}
