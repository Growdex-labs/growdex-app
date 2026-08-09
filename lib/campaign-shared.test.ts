import { describe, expect, it } from "vitest";
import { isVideoMedia } from "./campaign-shared";

describe("isVideoMedia", () => {
  it("treats signed TikTok preview URLs as video without a file extension", () => {
    expect(
      isVideoMedia({
        url: "https://video.example.test/preview?token=signed",
        platform: "tiktok",
      }),
    ).toBe(true);
  });

  it("trusts the provider media type before inspecting the URL", () => {
    expect(
      isVideoMedia({
        url: "https://video.example.test/asset",
        mediaType: "VIDEO",
      }),
    ).toBe(true);
  });

  it("keeps ordinary image URLs as images", () => {
    expect(
      isVideoMedia({
        url: "https://images.example.test/creative.jpg",
        platform: "meta",
        mediaType: "image",
      }),
    ).toBe(false);
  });
});
