import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bindAnalyticsClient,
  clearIdentifiedUser,
  identifyUser,
  resetAnalyticsForTests,
  track,
  trackScreenBlocked,
  trackScreenCompleted,
  trackScreenViewed,
} from "./analytics";

const stubRybbit = () => {
  const client = {
    event: vi.fn(),
    identify: vi.fn(),
    clearUserId: vi.fn(),
  };
  Object.assign(globalThis, {
    window: {
      rybbit: client,
      setInterval: globalThis.setInterval.bind(globalThis),
      clearInterval: globalThis.clearInterval.bind(globalThis),
    },
  });
  return client;
};

afterEach(() => {
  resetAnalyticsForTests();
  Reflect.deleteProperty(globalThis, "window");
});

describe("analytics", () => {
  it("does nothing when window is missing", () => {
    expect(() => track("screen_viewed", { flow: "signup" })).not.toThrow();
  });

  it("sends events when Rybbit is already loaded", () => {
    const client = stubRybbit();

    trackScreenViewed("onboarding", "profile");
    trackScreenCompleted("onboarding", "profile");
    trackScreenBlocked("onboarding", "profile", "missing_name");

    expect(client.event).toHaveBeenCalledWith("screen_viewed", {
      flow: "onboarding",
      screen: "profile",
    });
    expect(client.event).toHaveBeenCalledWith("screen_completed", {
      flow: "onboarding",
      screen: "profile",
    });
    expect(client.event).toHaveBeenCalledWith("screen_blocked", {
      flow: "onboarding",
      screen: "profile",
      reason: "missing_name",
    });
  });

  it("queues events until the script binds", () => {
    Object.assign(globalThis, {
      window: {
        setInterval: globalThis.setInterval.bind(globalThis),
        clearInterval: globalThis.clearInterval.bind(globalThis),
      },
    });

    track("campaign_published", { creation_mode: "manual" });

    const client = {
      event: vi.fn(),
      identify: vi.fn(),
      clearUserId: vi.fn(),
    };
    window.rybbit = client;
    expect(bindAnalyticsClient()).toBe(true);
    expect(client.event).toHaveBeenCalledWith("campaign_published", {
      creation_mode: "manual",
    });
  });

  it("identifies and clears users", () => {
    const client = stubRybbit();

    identifyUser("user-1", { onboarding_completed: true });
    clearIdentifiedUser();

    expect(client.identify).toHaveBeenCalledWith("user-1", {
      onboarding_completed: true,
    });
    expect(client.clearUserId).toHaveBeenCalled();
  });
});
