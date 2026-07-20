import { describe, expect, it } from "vitest";
import type { CreateCampaignPayload } from "@/lib/campaigns";
import { getAudienceReadiness } from "./AudienceReachCard";

type Audience = CreateCampaignPayload["audience"];

const readyAudience = (): Audience => ({
  locations: ["NG"],
  ageMin: 18,
  ageMax: 65,
  gender: "all",
  interests: [],
  includeAudienceIds: [],
  excludeAudienceIds: [],
  languages: [],
  devices: ["mobile"],
});

describe("getAudienceReadiness", () => {
  it("marks an audience ready when Meta can forecast it", () => {
    const result = getAudienceReadiness(readyAudience(), {
      lower: 120_000,
      upper: 190_000,
      ready: true,
      source: "meta",
    });

    expect(result).toMatchObject({ score: 100, status: "ready", issues: [] });
  });

  it("uses Meta's readiness result to identify a narrow audience", () => {
    const result = getAudienceReadiness(readyAudience(), {
      lower: null,
      upper: 1_000,
      ready: false,
      source: "meta",
    });

    expect(result.score).toBe(75);
    expect(result.status).toBe("attention");
    expect(result.issues.map((issue) => issue.code)).toContain(
      "audience-too-narrow",
    );
  });

  it("reports blocking targeting conflicts before publishing", () => {
    const audience = readyAudience();
    audience.locations = [];
    audience.devices = [];
    audience.includeAudienceIds = ["saved-1"];
    audience.excludeAudienceIds = ["saved-1"];

    const result = getAudienceReadiness(audience, null, 2);

    expect(result.status).toBe("blocked");
    expect(result.score).toBe(0);
    expect(result.issues.map((issue) => issue.code)).toEqual([
      "missing-location",
      "missing-devices",
      "conflicting-saved-audience",
      "unavailable-interests",
    ]);
  });

  it("blocks invalid ages and unavailable Meta interests", () => {
    const audience = readyAudience();
    audience.ageMin = 54;
    audience.ageMax = 30;

    const result = getAudienceReadiness(audience, null, 1);

    expect(result.status).toBe("blocked");
    expect(result.issues.map((issue) => issue.code)).toEqual([
      "invalid-age-range",
      "unavailable-interests",
    ]);
  });
});
