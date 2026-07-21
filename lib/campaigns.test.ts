import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "./auth";
import {
  fetchMetaLeadForms,
  parseAiCampaignDraftResponse,
  parseCampaignNameSuggestion,
  parseCampaignOptimizationResponse,
  createInitialCampaignPayload,
  validateCampaignCreativeSetup,
  validateCampaignDraftPayload,
  validateCampaignPayload,
  type MetaSpecialAdCategory,
} from "./campaigns";

vi.mock("./auth", () => ({ apiFetch: vi.fn() }));

describe("parseCampaignNameSuggestion", () => {
  it("accepts a readable campaign title", () => {
    expect(
      parseCampaignNameSuggestion({
        name: "Find Your Next Home",
        rationale: "It connects the campaign to a clear customer benefit.",
      }).name,
    ).toBe("Find Your Next Home");
  });

  it.each(["META_LEAD_REALESTATE_CONV_Q1", "META LEAD REAL ESTATE Q1"])(
    "rejects internal naming syntax: %s",
    (name) => {
      expect(() =>
        parseCampaignNameSuggestion({
          name,
          rationale: "Internal taxonomy.",
        }),
      ).toThrow("instead of a campaign title");
    },
  );
});

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
      specialAdCategories: [] as MetaSpecialAdCategory[],
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
  it("reports a missing ad set name instead of crashing on older campaign data", () => {
    const draft = createInitialCampaignPayload();
    draft.campaign.name = "Existing campaign";
    delete (
      draft.campaign.configuration as Partial<
        typeof draft.campaign.configuration
      >
    ).adSetName;

    expect(validateCampaignDraftPayload(draft)).toBe(
      "Enter an ad set name before saving the draft.",
    );
  });

  it("requires an ad set name", () => {
    const draft = createInitialCampaignPayload();
    draft.campaign.name = "Unfinished launch";
    draft.campaign.configuration.adSetName = "";
    expect(validateCampaignDraftPayload(draft)).toContain("ad set name");
  });

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

describe("Meta special ad category validation", () => {
  it("requires broad targeting for housing campaigns", () => {
    const campaign = createInitialCampaignPayload();
    campaign.campaign.name = "Find your next home";
    campaign.campaign.platforms = ["meta"];
    campaign.campaign.configuration.accountAssetIds = { meta: "account-1" };
    campaign.campaign.configuration.specialAdCategories = ["HOUSING"];
    campaign.audience.ageMin = 25;
    campaign.audience.interests = ["Property investment"];
    campaign.budget.amount = 5_000;
    campaign.budget.startDate = "2030-01-01T00:00:00.000Z";

    expect(validateCampaignPayload(campaign)).toContain(
      "requires ages 18–65",
    );
  });
});

describe("validateCampaignCreativeSetup", () => {
  it("routes incomplete media to creative setup and completed media onward", () => {
    const campaign = createInitialCampaignPayload();
    campaign.campaign.name = "Luxury leads";
    campaign.campaign.goal = "LEADS";
    campaign.campaign.platforms = ["meta"];
    campaign.campaign.configuration.destination = "INSTANT_FORM";
    campaign.campaign.configuration.accountAssetIds = { meta: "account-1" };
    campaign.budget.startDate = "2020-01-01T00:00:00.000Z";
    campaign.adContent.creatives = [
      {
        platform: "meta",
        primaryText: "Discover premium homes in Lagos.",
        headline: "Own your luxury home",
        cta: "SIGN_UP",
        mediaUrl: "",
        leadFormId: "lead-form-1",
      },
    ];

    expect(validateCampaignCreativeSetup(campaign)).toBe(
      "Upload media for Meta.",
    );

    campaign.adContent.creatives[0].mediaUrl =
      "https://images.example.com/luxury-home.jpg";
    expect(validateCampaignCreativeSetup(campaign)).toBeNull();
  });

  it("accepts Meta WhatsApp leads without a website URL", () => {
    const campaign = createInitialCampaignPayload();
    campaign.campaign.name = "WhatsApp leads";
    campaign.campaign.goal = "LEADS";
    campaign.campaign.platforms = ["meta"];
    campaign.campaign.configuration.destination = "WHATSAPP";
    campaign.campaign.configuration.optimizationGoal = "MESSAGES";
    campaign.campaign.configuration.accountAssetIds = { meta: "account-1" };
    campaign.adContent.creatives = [
      {
        platform: "meta",
        primaryText: "Message our team to learn more.",
        cta: "CONTACT_US",
        mediaUrl: "https://images.example.com/whatsapp-leads.jpg",
      },
    ];

    expect(validateCampaignCreativeSetup(campaign)).toBeNull();
  });

  it.each(["VIDEO", "PROFILE"] as const)(
    "accepts an awareness %s destination without a website URL",
    (destination) => {
      const campaign = createInitialCampaignPayload();
      campaign.campaign.name = "Brand awareness";
      campaign.campaign.platforms = ["meta"];
      campaign.campaign.configuration.destination = destination;
      campaign.campaign.configuration.optimizationGoal =
        destination === "VIDEO" ? "VIDEO_VIEWS" : "FOLLOWERS";
      campaign.campaign.configuration.accountAssetIds = { meta: "account-1" };
      campaign.adContent.creatives = [
        {
          platform: "meta",
          primaryText: "Discover our brand.",
          cta: "LEARN_MORE",
          mediaUrl:
            destination === "VIDEO"
              ? "https://media.example.com/awareness.mp4"
              : "https://media.example.com/awareness.jpg",
        },
      ];

      expect(validateCampaignCreativeSetup(campaign)).toBeNull();
    },
  );
});

describe("fetchMetaLeadForms", () => {
  it("loads only the non-sensitive form metadata used by campaign creation", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          page: { id: "page-1", name: "Growdex Agency" },
          adAccount: {
            assetId: "asset-1",
            id: "account-1",
            name: "Growdex Ads",
          },
          forms: [
            {
              id: "form-1",
              name: "Property enquiry",
              status: "ACTIVE",
              locale: "en_GB",
            },
          ],
          paging: { nextCursor: null },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await fetchMetaLeadForms("asset-1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/campaigns/lead-forms?assetId=asset-1&limit=100",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.forms).toEqual([
      {
        id: "form-1",
        name: "Property enquiry",
        status: "ACTIVE",
        locale: "en_GB",
      },
    ]);
    expect(result).not.toHaveProperty("leads");
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

  it("rejects WhatsApp destinations when TikTok is selected", () => {
    const response = readyResponse();
    response.draft.configuration.destination = "WHATSAPP";
    response.draft.configuration.optimizationGoal = "MESSAGES";
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "TikTok WhatsApp campaigns are not supported",
    );
  });

  it("rejects conversion drafts without a source for every platform", () => {
    const response = readyResponse();
    response.draft.configuration.optimizationGoal = "CONVERSIONS";
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "conversion event source is required",
    );
  });

  it("accepts compliant AI housing campaigns and rejects restricted interests", () => {
    const response = readyResponse();
    response.draft.platforms = ["meta"];
    response.draft.creatives = response.draft.creatives.filter(
      (creative) => creative.platform === "meta",
    );
    delete response.draft.configuration.accountAssetIds.tiktok;
    response.draft.configuration.specialAdCategories = ["HOUSING"];
    Object.assign(response.draft.audience, {
      ageMin: 18,
      ageMax: 65,
      gender: "all",
      interests: [],
    });

    expect(parseAiCampaignDraftResponse(response).status).toBe("ready");

    response.draft.audience.interests = ["Property investment"];
    expect(() => parseAiCampaignDraftResponse(response)).toThrow(
      "restricted Meta categories require broad",
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
