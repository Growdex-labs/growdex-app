import { describe, expect, it } from "vitest";
import {
  parseAiCampaignDraftResponse,
  parseCampaignOptimizationResponse,
  createInitialCampaignPayload,
  validateCampaignDraftPayload,
} from "./campaigns";

const readyResponse = () => ({
  status: "ready",
  draftId: "draft-1",
  revision: 1,
  changedSteps: [
    "setup",
    "platform",
    "goals",
    "event",
    "audience",
    "budget",
    "creative",
  ],
  messages: [
    { role: "user", content: "Launch a campaign" },
    { role: "assistant", content: "Your draft is ready." },
  ],
  draft: {
    name: "Nigeria launch",
    goal: "TRAFFIC",
    platforms: ["meta", "tiktok"],
    configuration: {
      destination: "WEBSITE",
      optimizationGoal: "LINK_CLICKS",
      accountAssetIds: { meta: "meta-account", tiktok: "tiktok-account" },
      eventSourceIds: {},
      sameCreativeForAll: false,
    },
    audience: {
      locations: ["NG"],
      ageMin: 21,
      ageMax: 45,
      gender: "all",
      interests: ["Business"],
      includeAudienceIds: [],
      excludeAudienceIds: [],
      languages: ["English"],
      devices: ["mobile"],
    },
    budget: {
      amount: 50_000,
      currency: "NGN",
      type: "daily",
      durationDays: 7,
      startDateLocal: "2030-01-01T09:00:00.000Z",
      endDateLocal: "2030-01-08T09:00:00.000Z",
    },
    creatives: [
      {
        platform: "meta",
        primaryText: "Meet your next growth partner.",
        headline: "Grow in Nigeria",
        cta: "LEARN_MORE",
        mediaUrl: "https://cdn.example.com/meta.png",
        landingPageUrl: "https://example.com",
        mediaRequirement: "image",
        mediaStatus: "ready",
      },
      {
        platform: "tiktok",
        primaryText: "A faster way to grow.",
        headline: "Grow in Nigeria",
        cta: "LEARN_MORE",
        mediaUrl: "",
        landingPageUrl: "https://example.com",
        mediaRequirement: "video",
        mediaStatus: "required",
      },
    ],
    rationale: "Traffic is the clearest match for the launch brief.",
    stepRationales: {
      setup: "A clear campaign name was generated from the launch market.",
      platforms: "Both connected platforms can support website traffic.",
      goal: "Traffic matches the requested outcome.",
      event: "Link clicks measure the selected website destination.",
      audience: "The audience matches the supplied market and offer.",
      budget: "The budget supports a seven-day learning period.",
      creative: "Each platform has its own compatible creative requirement.",
    },
  },
});

describe("parseCampaignOptimizationResponse", () => {
  const response = () => ({
    campaignId: "campaign-1",
    revision: 3,
    generatedAt: "2030-01-02T10:00:00.000Z",
    proposals: [
      {
        id: "proposal-1",
        title: "Narrow the mobile audience",
        summary: "Shift spend toward the age range with the strongest conversion rate.",
        evidence: {
          metric: "Cost per conversion",
          window: "Last 14 days",
          observation: "Ages 25–34 converted 38% below the campaign average.",
        },
        expectedOutcome: "Lower cost per conversion while keeping reach stable.",
        risk: "A narrower audience may reduce total impressions.",
        affectedFields: ["audience.ageMin", "audience.ageMax"],
      },
    ],
  });

  it("accepts evidence-backed proposals", () => {
    const result = parseCampaignOptimizationResponse(response());
    expect(result.proposals[0].evidence.window).toBe("Last 14 days");
  });

  it("rejects proposals without affected fields", () => {
    const value = response();
    value.proposals[0].affectedFields = [];
    expect(() => parseCampaignOptimizationResponse(value)).toThrow(
      "has no affected fields",
    );
  });
});

describe("validateCampaignDraftPayload", () => {
  it("allows an incomplete but structurally valid draft", () => {
    const draft = createInitialCampaignPayload();
    draft.campaign.name = "Unfinished launch";
    expect(validateCampaignDraftPayload(draft)).toBeNull();
  });

  it("still rejects structurally invalid draft data", () => {
    const draft = createInitialCampaignPayload();
    draft.campaign.name = "Invalid ages";
    draft.audience.ageMin = 50;
    draft.audience.ageMax = 30;
    expect(validateCampaignDraftPayload(draft)).toContain("Audience age");
  });
});

describe("parseAiCampaignDraftResponse", () => {
  it("accepts a complete platform-specific draft", () => {
    const result = parseAiCampaignDraftResponse(readyResponse());
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("Expected a ready response");
    expect(result.draft.creatives).toHaveLength(2);
    expect(result.draft.stepRationales.event).toContain("Link clicks");
  });

  it("rejects a draft without an event-management explanation", () => {
    const response = readyResponse();
    delete (response.draft.stepRationales as Partial<typeof response.draft.stepRationales>).event;
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "event explanation is missing",
    );
  });

  it("rejects unsupported TikTok instant forms", () => {
    const response = readyResponse();
    response.draft.configuration.destination = "INSTANT_FORM";
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "TikTok instant forms are not supported",
    );
  });

  it("rejects conversion drafts without a source for every platform", () => {
    const response = readyResponse();
    response.draft.configuration.optimizationGoal = "CONVERSIONS";
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "conversion event source is required",
    );
  });

  it("rejects creatives marked ready without hosted media", () => {
    const response = readyResponse();
    response.draft.creatives[1].mediaStatus = "ready";
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "ready without media",
    );
  });

  it("parses model-driven clarification questions", () => {
    const result = parseAiCampaignDraftResponse({
      status: "needs_input",
      draftId: "draft-2",
      revision: 0,
      messages: [],
      question: {
        id: "budget",
        prompt: "Which budget should Growdex use?",
        allowMultiple: false,
        options: [
          { id: "starter", label: "Starter", description: "₦25,000 daily" },
          { id: "growth", label: "Growth", description: "₦75,000 daily" },
        ],
      },
    });
    expect(result.status).toBe("needs_input");
  });

  it("parses an answer without treating it as a campaign change", () => {
    const result = parseAiCampaignDraftResponse({
      status: "answer",
      draftId: "draft-1",
      revision: 1,
      messages: [],
      answer: "TikTok was selected because it is connected and supports the requested audience.",
    });
    expect(result.status).toBe("answer");
  });
});
