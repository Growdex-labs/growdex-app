import { afterEach, describe, expect, it, vi } from "vitest";
import { openPopupWindow } from "@/lib/popup";

const stubWindow = (open: ReturnType<typeof vi.fn>) => {
  Object.assign(globalThis, {
    window: {
      open,
      screenX: 100,
      screenY: 50,
      outerWidth: 1600,
      outerHeight: 1000,
    },
  });
};

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("openPopupWindow", () => {
  it("centers the popup over the current window", () => {
    const popup = { opener: {}, focus: vi.fn() };
    const open = vi.fn().mockReturnValue(popup);
    stubWindow(open);

    expect(openPopupWindow("https://business.facebook.com/billing", "meta")).toBe(
      popup,
    );

    const features = open.mock.calls[0][2] as string;
    expect(open).toHaveBeenCalledWith(
      "https://business.facebook.com/billing",
      "meta",
      expect.any(String),
    );
    expect(features).toContain("width=1024");
    expect(features).toContain("height=768");
    expect(features).toContain("left=388");
    expect(features).toContain("top=166");
  });

  it("keeps the address bar so the site is identifiable", () => {
    const open = vi.fn().mockReturnValue({ opener: {}, focus: vi.fn() });
    stubWindow(open);

    openPopupWindow("https://ads.tiktok.com/billing", "tiktok");

    expect(open.mock.calls[0][2]).toContain("location=yes");
  });

  it("cuts the popup's reference back to the app", () => {
    const popup = { opener: {} as unknown, focus: vi.fn() };
    stubWindow(vi.fn().mockReturnValue(popup));

    openPopupWindow("https://business.facebook.com/billing", "meta");

    expect(popup.opener).toBeNull();
    expect(popup.focus).toHaveBeenCalled();
  });

  it("reports a blocked popup", () => {
    stubWindow(vi.fn().mockReturnValue(null));

    expect(openPopupWindow("https://business.facebook.com/billing", "meta")).toBeNull();
  });

  it("never opens a window wider than the screen allows", () => {
    const open = vi.fn().mockReturnValue({ opener: {}, focus: vi.fn() });
    Object.assign(globalThis, {
      window: {
        open,
        screenX: 0,
        screenY: 0,
        outerWidth: 800,
        outerHeight: 600,
      },
    });

    openPopupWindow("https://business.facebook.com/billing", "meta");

    const features = open.mock.calls[0][2] as string;
    expect(features).toContain("width=800");
    expect(features).toContain("height=600");
    expect(features).toContain("left=0");
  });
});
