import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bindAnalyticsClient,
  clearIdentifiedUser,
  identifyUser,
  analyticsUserId,
  maskAnalyticsPath,
  resetAnalyticsForTests,
  track,
  trackScreenBlocked,
  trackScreenCompleted,
  trackScreenViewed,
} from "./analytics";

const previousAppEnv = process.env.NEXT_PUBLIC_APP_ENV;

const stubGoogleTag = () => {
  const client = vi.fn();
  Object.assign(globalThis, {
    window: {
      gtag: client,
      setInterval: globalThis.setInterval.bind(globalThis),
      clearInterval: globalThis.clearInterval.bind(globalThis),
    },
  });
  return client;
};

afterEach(() => {
  resetAnalyticsForTests();
  Reflect.deleteProperty(globalThis, "window");
  if (previousAppEnv === undefined) delete process.env.NEXT_PUBLIC_APP_ENV;
  else process.env.NEXT_PUBLIC_APP_ENV = previousAppEnv;
});

describe("analytics", () => {
  it("does nothing when window is missing", () => {
    expect(() => track("screen_viewed", { flow: "signup" })).not.toThrow();
  });

  it("does nothing outside production", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    const client = stubGoogleTag();

    track("screen_viewed", { flow: "signup" });
    identifyUser("user-1");

    expect(client).not.toHaveBeenCalled();
  });

  it("sends events when Google Analytics is already loaded", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    const client = stubGoogleTag();

    trackScreenViewed("onboarding", "profile");
    trackScreenCompleted("onboarding", "profile");
    trackScreenBlocked("onboarding", "profile", "missing_name");

    expect(client).toHaveBeenCalledWith("event", "screen_viewed", {
      flow: "onboarding",
      screen: "profile",
    });
    expect(client).toHaveBeenCalledWith("event", "screen_completed", {
      flow: "onboarding",
      screen: "profile",
    });
    expect(client).toHaveBeenCalledWith("event", "screen_blocked", {
      flow: "onboarding",
      screen: "profile",
      reason: "missing_name",
    });
  });

  it("queues events until the script binds", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    Object.assign(globalThis, {
      window: {
        setInterval: globalThis.setInterval.bind(globalThis),
        clearInterval: globalThis.clearInterval.bind(globalThis),
      },
    });

    track("campaign_published", { creation_mode: "manual" });

    const client = vi.fn();
    window.gtag = client;
    expect(bindAnalyticsClient()).toBe(true);
    expect(client).toHaveBeenCalledWith("event", "campaign_published", {
      creation_mode: "manual",
    });
  });

  it("identifies and clears users", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    const client = stubGoogleTag();

    identifyUser("user-1", { onboarding_completed: true });
    clearIdentifiedUser();

    expect(client).toHaveBeenCalledWith("set", { user_id: "user-1" });
    expect(client).toHaveBeenCalledWith("set", {
      user_properties: { onboarding_completed: true },
    });
    expect(client).toHaveBeenCalledWith("set", { user_id: null });
  });

  it("identifies a new account without a profile row", () => {
    expect(analyticsUserId({ id: "user-1", profile: null })).toBe("user-1");
    expect(analyticsUserId({ profile: { id: "profile-1" } })).toBe("profile-1");
    expect(analyticsUserId({ profile: null })).toBeUndefined();
  });

  it("masks identifiers in sensitive dashboard paths", () => {
    expect(maskAnalyticsPath("/panel/campaigns/campaign-123")).toBe(
      "/panel/campaigns/**",
    );
    expect(maskAnalyticsPath("/panel/campaigns/campaign-123/edit")).toBe(
      "/panel/campaigns/**",
    );
    expect(maskAnalyticsPath("/panel/billing/budget/budget-456/edit")).toBe(
      "/panel/billing/budget/**",
    );
    expect(maskAnalyticsPath("/panel/assets")).toBe("/panel/assets");
  });
});
