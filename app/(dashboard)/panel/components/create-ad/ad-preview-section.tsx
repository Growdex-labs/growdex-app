"use client";

import React from "react";
import { MetaAdPreview } from "./preview/meta-ad-preview";
import { TikTokAdPreview } from "./preview/tiktok-ad-preview";

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
  if (activePlatform === "meta") {
    return (
      <MetaAdPreview
        brandName="Growdex Limited"
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
      username="@growdex"
      caption={caption}
      creative={creative}
      profilePic="/logo.png"
    />
  );
}
