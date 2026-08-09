import { describe, expect, it } from "vitest";
import type { CreativeAsset } from "@/lib/assets";
import type { CampaignCreativeInput } from "@/lib/campaigns";
import { mergeSelectedAssets } from "./creative-setup-state";

const creative = (
  platform: CampaignCreativeInput["platform"],
  mediaUrl = "",
): CampaignCreativeInput => ({
  platform,
  primaryText: `${platform} copy`,
  headline: `${platform} headline`,
  cta: "LEARN_MORE",
  mediaUrl,
  landingPageUrl: "https://growdex.test/offer",
});

const asset = (
  id: string,
  platform: CreativeAsset["platform"],
): CreativeAsset => ({
  id,
  name: `Asset ${id}`,
  url: `https://cdn.growdex.test/${id}.${platform === "meta" ? "jpg" : "mp4"}`,
  platform,
  campaignId: "campaign-1",
  campaignName: "Campaign one",
  status: "draft",
  createdAt: "2026-07-20T10:00:00.000Z",
  kind: "asset",
});

describe("mergeSelectedAssets", () => {
  it("keeps platform-specific media while carrying the existing ad copy into selected assets", () => {
    const result = mergeSelectedAssets(
      [asset("meta-one", "meta"), asset("tiktok-one", "tiktok")],
      [creative("meta"), creative("tiktok")],
      ["meta", "tiktok"],
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      platform: "meta",
      primaryText: "meta copy",
      mediaUrl: "https://cdn.growdex.test/meta-one.jpg",
    });
    expect(result[1]).toMatchObject({
      platform: "tiktok",
      primaryText: "tiktok copy",
      mediaUrl: "https://cdn.growdex.test/tiktok-one.mp4",
    });
  });

  it("keeps the thumbnail for a signed TikTok video URL without a file extension", () => {
    const tiktok = asset("tiktok-signed", "tiktok");
    tiktok.url = "https://video.example.test/preview?token=signed";
    tiktok.mediaType = "video";
    tiktok.thumbnailUrl = "https://video.example.test/poster.jpg";

    const result = mergeSelectedAssets(
      [tiktok],
      [creative("tiktok")],
      ["tiktok"],
    );

    expect(result[0]).toMatchObject({
      platform: "tiktok",
      mediaUrl: tiktok.url,
      thumbnailUrl: tiktok.thumbnailUrl,
    });
  });

  it("reserves a slot for every required platform within the six-asset selection cap", () => {
    const assets = Array.from({ length: 8 }, (_, index) =>
      asset(`meta-${index + 1}`, "meta"),
    );
    const tiktok = creative("tiktok", "https://cdn.growdex.test/current.mp4");

    const result = mergeSelectedAssets(
      assets,
      [creative("meta"), tiktok],
      ["meta", "tiktok"],
    );

    expect(result).toHaveLength(6);
    expect(result.filter((item) => item.platform === "meta")).toHaveLength(5);
    expect(result.at(-1)).toEqual(tiktok);
  });

  it("keeps a required platform placeholder when selection capacity remains", () => {
    const result = mergeSelectedAssets(
      [asset("meta-one", "meta")],
      [creative("meta"), creative("tiktok")],
      ["meta", "tiktok"],
    );

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({ platform: "tiktok", mediaUrl: "" });
  });
});
