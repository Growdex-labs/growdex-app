import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  LIBRARY_UPLOADS_STORAGE_KEY,
  libraryAssetFromUpload,
  persistLibraryUpload,
  readLibraryUploads,
} from "./assets";

const memory = new Map<string, string>();

beforeAll(() => {
  const localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage },
  });
});

afterEach(() => {
  memory.clear();
});

describe("libraryAssetFromUpload", () => {
  it("tags images as Meta library assets", () => {
    const asset = libraryAssetFromUpload({
      url: "https://res.example.test/image/upload/creative.jpg",
      name: "Spring launch",
      mediaType: "image",
    });

    expect(asset.platform).toBe("meta");
    expect(asset.kind).toBe("asset");
    expect(asset.campaignName).toBe("Uploaded");
    expect(asset.mediaType).toBe("image");
    expect(asset.id.startsWith("library:")).toBe(true);
  });

  it("tags videos as TikTok library assets", () => {
    const asset = libraryAssetFromUpload({
      url: "https://res.example.test/video/upload/creative.mp4",
      name: "Store walkthrough",
      mediaType: "video",
      thumbnailUrl: "https://res.example.test/video/upload/so_0/creative.jpg",
    });

    expect(asset.platform).toBe("tiktok");
    expect(asset.mediaType).toBe("video");
    expect(asset.thumbnailUrl).toBe(
      "https://res.example.test/video/upload/so_0/creative.jpg",
    );
  });
});

describe("library upload persistence", () => {
  it("stores uploads and returns the newest first", () => {
    persistLibraryUpload({
      url: "https://res.example.test/image/upload/one.jpg",
      name: "One",
      mediaType: "image",
    });
    persistLibraryUpload({
      url: "https://res.example.test/video/upload/two.mp4",
      name: "Two",
      mediaType: "video",
    });

    expect(readLibraryUploads().map((asset) => asset.name)).toEqual([
      "Two",
      "One",
    ]);
  });

  it("replaces an existing upload with the same URL", () => {
    persistLibraryUpload({
      url: "https://res.example.test/image/upload/same.jpg",
      name: "Old name",
      mediaType: "image",
    });
    persistLibraryUpload({
      url: "https://res.example.test/image/upload/same.jpg",
      name: "New name",
      mediaType: "image",
    });

    const stored = readLibraryUploads();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.name).toBe("New name");
  });

  it("ignores corrupt storage instead of throwing", () => {
    window.localStorage.setItem(LIBRARY_UPLOADS_STORAGE_KEY, "{not-json");
    expect(readLibraryUploads()).toEqual([]);
  });
});
