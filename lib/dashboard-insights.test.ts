import { describe, expect, it } from "vitest";
import { buildDashboardInsights } from "./dashboard-insights";
import type { PanelMetrics } from "./panel";

const emptyMetrics = (): PanelMetrics => ({
  spendByCurrency: [],
  revenueByCurrency: [],
  byCurrency: [],
  totalImpressions: 0,
  totalClicks: 0,
  totalConversions: 0,
  totalReach: 0,
  ctr: 0,
  byPlatform: {},
  dailySpend: [],
});

describe("buildDashboardInsights", () => {
  it("compares platform CTR when both sides have data", () => {
    const copy = buildDashboardInsights({
      ...emptyMetrics(),
      totalImpressions: 1000,
      totalClicks: 80,
      byPlatform: {
        meta: {
          impressions: 600,
          clicks: 30,
          conversions: 4,
          reach: 400,
          ctr: 5,
          spendByCurrency: [],
          revenueByCurrency: [],
        },
        tiktok: {
          impressions: 400,
          clicks: 50,
          conversions: 6,
          reach: 300,
          ctr: 12.5,
          spendByCurrency: [],
          revenueByCurrency: [],
        },
      },
    });

    expect(copy.insights[0]).toContain("5%");
    expect(copy.insights[0]).toContain("12.5%");
    expect(copy.insights.some((line) => line.includes("TikTok"))).toBe(true);
    expect(copy.recommendations.length).toBeGreaterThan(0);
  });

  it("does not invent platform rates when none are present", () => {
    const copy = buildDashboardInsights(emptyMetrics());
    expect(copy.insights.join(" ")).not.toMatch(/\d+%/);
    expect(copy.headline).toContain("Click any chart");
  });
});
