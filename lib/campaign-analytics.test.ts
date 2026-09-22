import { describe, expect, it } from "vitest";
import { deriveMetrics, detectHealthSignals, normalizePlatformMetric, primaryResultForObjective, type NormalizedMetric } from "./campaign-analytics";

const metric = (name: NormalizedMetric["name"], value: number | null): NormalizedMetric => ({ name, value, platform: "meta", campaignId: "c1", objective: "SALES", entityLevel: "campaign", timestamp: "2026-09-01T00:00:00Z", sourceMetricName: `meta:${name}`, dataStatus: "final", currency: "NGN" });

describe("campaign analytics derivations", () => {
  it("calculates core values without dividing by zero", () => {
    const values = deriveMetrics([metric("spend", 500), metric("impressions", 10000), metric("reach", 2500), metric("clicks", 100), metric("conversions", 10), metric("conversion_value", 1500)]);
    expect(Object.fromEntries(values.map((value) => [value.name, value.value]))).toMatchObject({ frequency: 4, cpm: 50, ctr: 1, cpc: 5, cost_per_result: 50, roas: 3 });
    expect(deriveMetrics([metric("spend", 500), metric("impressions", 0), metric("clicks", 0)]).every((value) => value.value === null)).toBe(true);
  });
  it("selects an objective-specific primary result", () => {
    expect(primaryResultForObjective("AWARENESS")).toBe("reach");
    expect(primaryResultForObjective("TRAFFIC")).toBe("link_clicks");
    expect(primaryResultForObjective("LEADS")).toBe("leads");
  });
  it("requires multiple trends before flagging fatigue", () => {
    expect(detectHealthSignals(new Map([["frequency", 3], ["ctr", 0.8], ["cpc", 6]]), new Map([["frequency", 2], ["ctr", 1.2], ["cpc", 5]]))).toHaveLength(2);
    expect(detectHealthSignals(new Map([["frequency", 3], ["ctr", 1.2]]), new Map([["frequency", 2], ["ctr", 1.2]]))).toHaveLength(0);
  });
  it("preserves platform-native metric definitions when normalizing Meta and TikTok", () => {
    const context = { campaignId: "c1", objective: "TRAFFIC" as const, entityLevel: "campaign" as const, timestamp: "2026-09-01T00:00:00Z", dataStatus: "delayed" as const, currency: "NGN" };
    expect(normalizePlatformMetric({ name: "inline_link_clicks", value: 7 }, { ...context, platform: "meta" })).toMatchObject({ name: "link_clicks", sourceMetricName: "inline_link_clicks" });
    expect(normalizePlatformMetric({ name: "clicks", value: 7 }, { ...context, platform: "tiktok" })).toMatchObject({ name: "clicks", sourceMetricName: "clicks" });
    expect(normalizePlatformMetric({ name: "unknown", value: 7 }, { ...context, platform: "meta" })).toBeNull();
  });
});
