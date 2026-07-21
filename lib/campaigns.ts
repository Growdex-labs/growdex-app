import { apiFetch } from "./auth";

export type CampaignGoal =
  | "AWARENESS"
  | "TRAFFIC"
  | "ENGAGEMENT"
  | "SALES"
  | "LEADS"
  | "APP_PROMOTION";

export type CampaignPlatform = "meta" | "tiktok";
export type CampaignCreationMode = "manual" | "ai";
export type CampaignGender = "all" | "male" | "female";
export type BudgetType = "daily" | "lifetime";
export type CampaignCurrency = string;
export type MetaSpecialAdCategory =
  | "CREDIT"
  | "EMPLOYMENT"
  | "FINANCIAL_PRODUCTS_SERVICES"
  | "HOUSING"
  | "ISSUES_ELECTIONS_POLITICS"
  | "ONLINE_GAMBLING_AND_GAMING";
export type CampaignDestination =
  | "WEBSITE"
  | "INSTANT_FORM"
  | "WHATSAPP"
  | "MESSENGER"
  | "PROFILE"
  | "VIDEO"
  | "APP";
export type CampaignOptimizationGoal =
  | "REACH"
  | "IMPRESSIONS"
  | "LINK_CLICKS"
  | "LANDING_PAGE_VIEWS"
  | "POST_ENGAGEMENT"
  | "VIDEO_VIEWS"
  | "LEAD_GENERATION"
  | "CONVERSIONS"
  | "APP_INSTALLS"
  | "APP_EVENTS"
  | "FOLLOWERS"
  | "MESSAGES";
export interface CampaignConfiguration {
  accountAssetIds?: Partial<Record<CampaignPlatform, string>>;
  specialAdCategories: MetaSpecialAdCategory[];
  sameCreativeForAll: boolean;
  budgetOptimization: "campaign" | "audience_strategy";
}

export interface AudienceStrategyConfiguration {
  destination: CampaignDestination;
  optimizationGoal: CampaignOptimizationGoal;
  eventSourceIds?: Partial<Record<CampaignPlatform, string>>;
}
export type CampaignCta =
  | "LEARN_MORE"
  | "SHOP_NOW"
  | "SIGN_UP"
  | "DOWNLOAD"
  | "BOOK_NOW"
  | "CONTACT_US"
  | "GET_QUOTE"
  | "SUBSCRIBE"
  | "APPLY_NOW"
  | "NO_BUTTON";

export interface CampaignCreativeInput {
  platform: CampaignPlatform;
  primaryText: string;
  headline?: string;
  cta: CampaignCta;
  mediaUrl: string;
  landingPageUrl?: string;
  appId?: string;
  leadFormId?: string;
}

export interface MetaLeadForm {
  id: string;
  name: string;
  status: string;
  locale: string | null;
}

export interface MetaLeadFormsResponse {
  page: { id: string; name: string };
  adAccount: { assetId: string; id: string; name: string };
  forms: MetaLeadForm[];
  paging: { nextCursor: string | null };
}

export interface CreateCampaignPayload {
  creationMode: CampaignCreationMode;
  campaign: {
    name: string;
    goal: CampaignGoal;
    platforms: CampaignPlatform[];
    configuration: CampaignConfiguration;
  };
  audienceStrategies: AudienceStrategy[];
}

export interface AudienceStrategy {
  id: string;
  name: string;
  configuration: AudienceStrategyConfiguration;
  audience: {
    locations: string[];
    ageMin?: number;
    ageMax?: number;
    gender?: CampaignGender;
    interests?: string[];
    includeAudienceIds?: string[];
    excludeAudienceIds?: string[];
    languages?: string[];
    devices?: Array<"mobile" | "desktop">;
  };
  budget: {
    amount: number;
    currency: CampaignCurrency;
    type: BudgetType;
    startDate: string;
    endDate?: string;
  };
  ads: CampaignCreativeInput[];
}

export interface GeneratedCampaignDraft {
  name: string;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  configuration: CampaignConfiguration & AudienceStrategyConfiguration;
  audience: AudienceStrategy["audience"];
  budget: {
    amount: number;
    currency: CampaignCurrency;
    type: BudgetType;
    durationDays: number;
    startDateLocal?: string | null;
    endDateLocal?: string | null;
  };
  creatives: Array<
    CampaignCreativeInput & {
      mediaRequirement: "image" | "video";
      mediaStatus: "ready" | "required" | "generating";
    }
  >;
  rationale: string;
  stepRationales: Record<
    | "setup"
    | "goal"
    | "platforms"
    | "event"
    | "audience"
    | "budget"
    | "creative",
    string
  >;
}

export const AI_CAMPAIGN_STEP_IDS = [
  "setup",
  "platform",
  "goals",
  "event",
  "audience",
  "budget",
  "creative",
] as const;

export type AiCampaignStepId = (typeof AI_CAMPAIGN_STEP_IDS)[number];

export interface AiCampaignMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiCampaignQuestion {
  id: string;
  prompt: string;
  allowMultiple: boolean;
  options: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

interface AiCampaignSessionBase {
  draftId: string;
  revision: number;
  messages: AiCampaignMessage[];
}

export type AiCampaignDraftResponse =
  | (AiCampaignSessionBase & {
      status: "needs_input";
      question: AiCampaignQuestion;
    })
  | (AiCampaignSessionBase & {
      status: "ready";
      draft: GeneratedCampaignDraft;
      changedSteps: AiCampaignStepId[];
    })
  | (AiCampaignSessionBase & {
      status: "answer";
      answer: string;
    });

export interface CampaignCreativeDto extends CampaignCreativeInput {
  id: string;
  audienceStrategyId: string;
  reviewStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface CampaignDto {
  id: string;
  name: string;
  creationMode: CampaignCreationMode | null;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  configuration: CampaignConfiguration;
  audienceStrategies: Array<Omit<AudienceStrategy, "ads">>;
  creatives?: CampaignCreativeDto[];
  status?: string;
  publishError?: string | null;
  createdAt?: string;
}

export type CampaignReviewPayload = Omit<
  CreateCampaignPayload,
  "creationMode"
> & {
  creationMode: CampaignCreationMode | "unknown";
};

export interface CampaignMetrics {
  summary: {
    totalSpend: number;
    activeCount: number;
    suspendedCount: number;
    scheduledCount: number;
    completedCount: number;
  };
  campaigns: CampaignDto[];
}

export interface CampaignAdviceResponse {
  answer: string;
}

export interface CampaignOptimizationProposal {
  id: string;
  title: string;
  summary: string;
  evidence: {
    metric: string;
    window: string;
    observation: string;
  };
  expectedOutcome: string;
  risk: string;
  affectedFields: string[];
}

export interface CampaignOptimizationResponse {
  campaignId: string;
  revision: number;
  generatedAt: string;
  proposals: CampaignOptimizationProposal[];
}

export interface CampaignNameSuggestion {
  name: string;
  rationale: string;
}

export interface CampaignCreativeSuggestion {
  field: "headline" | "caption";
  value: string;
  rationale: string;
}

export interface MetaInterest {
  id: string;
  name: string;
  audience_size?: number;
}

export interface AudienceReachForecast {
  lower: number | null;
  upper: number;
  ready: boolean;
  source: "meta";
}

export interface CampaignEventSource {
  id: string;
  name: string;
  platform: CampaignPlatform;
  lastActiveAt: string | null;
  available: boolean;
}

export interface ProviderLanguage {
  id: string;
  name: string;
}

const readJson = async (res: Response) => res.json().catch(() => ({}));

const getApiError = (data: unknown, fallback: string) => {
  if (!data || typeof data !== "object") return fallback;
  const response = data as {
    message?: unknown;
    errors?: Array<{ message?: unknown }>;
  };
  const fieldMessage = response.errors?.[0]?.message;
  if (typeof fieldMessage === "string") return fieldMessage;
  return typeof response.message === "string" ? response.message : fallback;
};

const CAMPAIGN_RATIONALE_KEYS = [
  "setup",
  "goal",
  "platforms",
  "event",
  "audience",
  "budget",
  "creative",
] as const;

const CAMPAIGN_GOALS: CampaignGoal[] = [
  "AWARENESS",
  "TRAFFIC",
  "ENGAGEMENT",
  "SALES",
  "LEADS",
  "APP_PROMOTION",
];
const CAMPAIGN_PLATFORMS: CampaignPlatform[] = ["meta", "tiktok"];
const CAMPAIGN_DESTINATIONS: CampaignDestination[] = [
  "WEBSITE",
  "INSTANT_FORM",
  "WHATSAPP",
  "MESSENGER",
  "PROFILE",
  "VIDEO",
  "APP",
];
const CAMPAIGN_OPTIMIZATIONS: CampaignOptimizationGoal[] = [
  "REACH",
  "IMPRESSIONS",
  "LINK_CLICKS",
  "LANDING_PAGE_VIEWS",
  "POST_ENGAGEMENT",
  "VIDEO_VIEWS",
  "LEAD_GENERATION",
  "CONVERSIONS",
  "APP_INSTALLS",
  "APP_EVENTS",
  "FOLLOWERS",
  "MESSAGES",
];
export const META_SPECIAL_AD_CATEGORIES: MetaSpecialAdCategory[] = [
  "CREDIT",
  "EMPLOYMENT",
  "FINANCIAL_PRODUCTS_SERVICES",
  "HOUSING",
  "ISSUES_ELECTIONS_POLITICS",
  "ONLINE_GAMBLING_AND_GAMING",
];
const RESTRICTED_META_TARGETING_CATEGORIES = new Set<MetaSpecialAdCategory>([
  "CREDIT",
  "EMPLOYMENT",
  "FINANCIAL_PRODUCTS_SERVICES",
  "HOUSING",
]);

export const hasRestrictedMetaTargeting = (
  categories: MetaSpecialAdCategory[],
) => categories.some((category) => RESTRICTED_META_TARGETING_CATEGORIES.has(category));
const CAMPAIGN_CTAS: CampaignCta[] = [
  "LEARN_MORE",
  "SHOP_NOW",
  "SIGN_UP",
  "DOWNLOAD",
  "BOOK_NOW",
  "CONTACT_US",
  "GET_QUOTE",
  "SUBSCRIBE",
  "APPLY_NOW",
  "NO_BUTTON",
];

const invalidAiResponse = (detail: string): never => {
  throw new Error(`The AI service returned an invalid campaign draft: ${detail}`);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    return invalidAiResponse(`${field} is missing.`);
  }
  return value.trim();
};

const optionalString = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return invalidAiResponse(`${field} must be text.`);
  return value.trim();
};

const enumValue = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T => {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return invalidAiResponse(`${field} is unsupported.`);
  }
  return value as T;
};

const stringArray = (value: unknown, field: string) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return invalidAiResponse(`${field} must be a list of text values.`);
  }
  return value.map((item) => item.trim()).filter(Boolean);
};

const parseGeneratedCampaignDraft = (
  data: unknown,
): GeneratedCampaignDraft => {
  if (!isRecord(data)) return invalidAiResponse("the response is not an object.");

  const goal = enumValue(data.goal, CAMPAIGN_GOALS, "goal");
  if (!Array.isArray(data.platforms) || !data.platforms.length) {
    return invalidAiResponse("at least one platform is required.");
  }
  const platforms = data.platforms.map((platform) =>
    enumValue(platform, CAMPAIGN_PLATFORMS, "platform"),
  );
  if (new Set(platforms).size !== platforms.length) {
    return invalidAiResponse("platforms must be unique.");
  }
  if (platforms.includes("tiktok") && goal === "APP_PROMOTION") {
    return invalidAiResponse("TikTok app-promotion campaigns are not supported.");
  }

  if (!isRecord(data.configuration)) {
    return invalidAiResponse("configuration is missing.");
  }
  const configuration = data.configuration;
  const destination = enumValue(
    configuration.destination,
    CAMPAIGN_DESTINATIONS,
    "destination",
  );
  const optimizationGoal = enumValue(
    configuration.optimizationGoal,
    CAMPAIGN_OPTIMIZATIONS,
    "optimization goal",
  );
  if (
    platforms.includes("tiktok") &&
    ["INSTANT_FORM", "WHATSAPP"].includes(destination)
  ) {
    return invalidAiResponse(
      `TikTok ${destination === "WHATSAPP" ? "WhatsApp campaigns are" : "instant forms are"} not supported.`,
    );
  }
  if (!isRecord(configuration.accountAssetIds)) {
    return invalidAiResponse("selected ad accounts are missing.");
  }
  const configuredAccountIds = configuration.accountAssetIds;
  const accountAssetIds = Object.fromEntries(
    platforms.map((platform) => [
      platform,
      requiredString(configuredAccountIds[platform], `${platform} ad account`),
    ]),
  ) as Partial<Record<CampaignPlatform, string>>;
  const configuredEventSourceIds = isRecord(configuration.eventSourceIds)
    ? configuration.eventSourceIds
    : null;
  const eventSourceIds = configuredEventSourceIds
    ? (Object.fromEntries(
        platforms.flatMap((platform) => {
          const id = optionalString(
            configuredEventSourceIds[platform],
            `${platform} event source`,
          );
          return id ? [[platform, id]] : [];
        }),
      ) as Partial<Record<CampaignPlatform, string>>)
    : {};
  const specialAdCategories = stringArray(
    configuration.specialAdCategories,
    "special ad categories",
  ).map((category) =>
    enumValue(category, META_SPECIAL_AD_CATEGORIES, "special ad category"),
  );
  if (specialAdCategories.length > 3) {
    return invalidAiResponse("at most three special ad categories are allowed.");
  }
  if (specialAdCategories.length && !platforms.includes("meta")) {
    return invalidAiResponse("special ad categories require Meta.");
  }
  if (
    optimizationGoal === "CONVERSIONS" &&
    platforms.some((platform) => !eventSourceIds[platform])
  ) {
    return invalidAiResponse("a conversion event source is required for every platform.");
  }

  if (!isRecord(data.audience)) return invalidAiResponse("audience is missing.");
  const audience = data.audience;
  const locations = stringArray(audience.locations, "audience locations");
  if (!locations.length) return invalidAiResponse("at least one audience location is required.");
  const ageMin = audience.ageMin ?? 18;
  const ageMax = audience.ageMax ?? 65;
  const gender = enumValue<CampaignGender>(
    audience.gender ?? "all",
    ["all", "male", "female"],
    "gender",
  );
  const interests = stringArray(audience.interests ?? [], "interests");
  if (
    typeof ageMin !== "number" ||
    typeof ageMax !== "number" ||
    ageMin < 18 ||
    ageMax > 65 ||
    ageMin > ageMax
  ) {
    return invalidAiResponse("audience ages must stay between 18 and 65.");
  }
  if (
    hasRestrictedMetaTargeting(specialAdCategories) &&
    (ageMin !== 18 || ageMax !== 65 || gender !== "all" || interests.length)
  ) {
    return invalidAiResponse(
      "restricted Meta categories require broad age, gender, and interest targeting.",
    );
  }

  if (!isRecord(data.budget)) return invalidAiResponse("budget is missing.");
  if (typeof data.budget.amount !== "number" || data.budget.amount <= 0) {
    return invalidAiResponse("budget amount must be greater than zero.");
  }
  const currency = requiredString(data.budget.currency, "currency");
  if (!/^[A-Z]{3}$/.test(currency)) {
    return invalidAiResponse("currency must be an uppercase ISO 4217 code.");
  }
  const budgetType = enumValue(data.budget.type, ["daily", "lifetime"], "budget type");
  if (
    typeof data.budget.durationDays !== "number" ||
    !Number.isInteger(data.budget.durationDays) ||
    data.budget.durationDays < 1
  ) {
    return invalidAiResponse("campaign duration must be at least one day.");
  }
  const startDateLocal = optionalString(data.budget.startDateLocal, "start date");
  const endDateLocal = optionalString(data.budget.endDateLocal, "end date");
  if (startDateLocal && Number.isNaN(new Date(startDateLocal).getTime())) {
    return invalidAiResponse("start date is invalid.");
  }
  if (endDateLocal && Number.isNaN(new Date(endDateLocal).getTime())) {
    return invalidAiResponse("end date is invalid.");
  }

  if (!Array.isArray(data.creatives) || !data.creatives.length) {
    return invalidAiResponse("platform-specific creatives are missing.");
  }
  const creatives = data.creatives.map((creative, index) => {
    if (!isRecord(creative)) return invalidAiResponse(`creative ${index + 1} is invalid.`);
    const platform = enumValue(creative.platform, CAMPAIGN_PLATFORMS, "creative platform");
    if (!platforms.includes(platform)) {
      return invalidAiResponse(`creative ${index + 1} uses an unselected platform.`);
    }
    const mediaRequirement = enumValue(
      creative.mediaRequirement,
      ["image", "video"],
      "creative media requirement",
    );
    const expectedMediaRequirement =
      platform === "tiktok" || destination === "VIDEO" ? "video" : "image";
    if (mediaRequirement !== expectedMediaRequirement) {
      return invalidAiResponse(`creative ${index + 1} has the wrong media requirement.`);
    }
    const mediaStatus = enumValue(
      creative.mediaStatus,
      ["ready", "required", "generating"],
      "creative media status",
    );
    const mediaUrl = optionalString(creative.mediaUrl, "creative media URL") ?? "";
    if (mediaStatus === "ready" && !mediaUrl) {
      return invalidAiResponse(`creative ${index + 1} is ready without media.`);
    }
    return {
      platform,
      primaryText: requiredString(creative.primaryText, "creative primary text"),
      headline: optionalString(creative.headline, "creative headline"),
      cta: enumValue(creative.cta, CAMPAIGN_CTAS, "creative CTA"),
      mediaUrl,
      landingPageUrl: optionalString(creative.landingPageUrl, "landing page URL"),
      appId: optionalString(creative.appId, "app ID"),
      leadFormId: optionalString(creative.leadFormId, "lead form ID"),
      mediaRequirement,
      mediaStatus,
    };
  });
  for (const platform of platforms) {
    if (!creatives.some((creative) => creative.platform === platform)) {
      return invalidAiResponse(`a ${platform} creative is required.`);
    }
  }

  if (!isRecord(data.stepRationales)) {
    return invalidAiResponse("review explanations are missing.");
  }
  const rationales = data.stepRationales;
  const stepRationales = Object.fromEntries(
    CAMPAIGN_RATIONALE_KEYS.map((key) => [
      key,
      requiredString(rationales[key], `${key} explanation`),
    ]),
  ) as GeneratedCampaignDraft["stepRationales"];

  const name = requiredString(data.name, "campaign name");
  return {
    name,
    goal,
    platforms,
    configuration: {
      destination,
      optimizationGoal,
      accountAssetIds,
      eventSourceIds,
      specialAdCategories,
      sameCreativeForAll: false,
      budgetOptimization: "audience_strategy",
    },
    audience: {
      locations,
      ageMin,
      ageMax,
      gender,
      interests,
      includeAudienceIds: stringArray(audience.includeAudienceIds ?? [], "included audiences"),
      excludeAudienceIds: stringArray(audience.excludeAudienceIds ?? [], "excluded audiences"),
      languages: stringArray(audience.languages ?? [], "languages"),
      devices: Array.isArray(audience.devices)
        ? audience.devices.map((device) => enumValue(device, ["mobile", "desktop"] as const, "device"))
        : ["mobile"],
    },
    budget: {
      amount: data.budget.amount,
      currency,
      type: budgetType,
      durationDays: data.budget.durationDays,
      startDateLocal,
      endDateLocal,
    },
    creatives,
    rationale: requiredString(data.rationale, "campaign rationale"),
    stepRationales,
  };
};

const parseAiMessages = (value: unknown): AiCampaignMessage[] => {
  if (!Array.isArray(value)) return [];
  return value.map((message, index) => {
    if (!isRecord(message)) return invalidAiResponse(`message ${index + 1} is invalid.`);
    return {
      role: enumValue(message.role, ["user", "assistant"], "message role"),
      content: requiredString(message.content, "message content"),
    };
  });
};

export const parseAiCampaignDraftResponse = (data: unknown): AiCampaignDraftResponse => {
  if (!isRecord(data)) return invalidAiResponse("the session response is not an object.");
  const draftId = requiredString(data.draftId, "draft session ID");
  if (typeof data.revision !== "number" || !Number.isInteger(data.revision) || data.revision < 0) {
    return invalidAiResponse("draft revision is invalid.");
  }
  const base = { draftId, revision: data.revision, messages: parseAiMessages(data.messages) };
  if (data.status === "needs_input") {
    if (!isRecord(data.question) || !Array.isArray(data.question.options) || !data.question.options.length) {
      return invalidAiResponse("clarifying question options are missing.");
    }
    return {
      ...base,
      status: "needs_input",
      question: {
        id: requiredString(data.question.id, "question ID"),
        prompt: requiredString(data.question.prompt, "question prompt"),
        allowMultiple: data.question.allowMultiple === true,
        options: data.question.options.map((option, index) => {
          if (!isRecord(option)) return invalidAiResponse(`question option ${index + 1} is invalid.`);
          return {
            id: requiredString(option.id, "question option ID"),
            label: requiredString(option.label, "question option label"),
            description: optionalString(option.description, "question option description"),
          };
        }),
      },
    };
  }
  if (data.status === "answer") {
    return {
      ...base,
      status: "answer",
      answer: requiredString(data.answer, "assistant answer"),
    };
  }
  if (data.status !== "ready") return invalidAiResponse("session status is unsupported.");
  if (!Array.isArray(data.changedSteps)) return invalidAiResponse("changed steps are missing.");
  const changedSteps = data.changedSteps.map((step) =>
    enumValue(step, AI_CAMPAIGN_STEP_IDS, "changed step"),
  );
  return { ...base, status: "ready", draft: parseGeneratedCampaignDraft(data.draft), changedSteps };
};

export const parseCampaignOptimizationResponse = (
  data: unknown,
): CampaignOptimizationResponse => {
  if (!isRecord(data)) {
    throw new Error("The AI optimization service returned an invalid response.");
  }
  if (typeof data.revision !== "number" || !Number.isInteger(data.revision) || data.revision < 0) {
    throw new Error("The AI optimization service returned an invalid revision.");
  }
  const generatedAt = requiredString(data.generatedAt, "optimization timestamp");
  if (Number.isNaN(new Date(generatedAt).getTime())) {
    throw new Error("The AI optimization service returned an invalid timestamp.");
  }
  if (!Array.isArray(data.proposals)) {
    throw new Error("The AI optimization service returned invalid proposals.");
  }
  return {
    campaignId: requiredString(data.campaignId, "optimization campaign ID"),
    revision: data.revision,
    generatedAt,
    proposals: data.proposals.map((proposal, index) => {
      if (!isRecord(proposal) || !isRecord(proposal.evidence)) {
        throw new Error(`AI optimization proposal ${index + 1} is invalid.`);
      }
      const evidence = proposal.evidence;
      const affectedFields = stringArray(
        proposal.affectedFields,
        `optimization proposal ${index + 1} affected fields`,
      );
      if (!affectedFields.length) {
        throw new Error(`AI optimization proposal ${index + 1} has no affected fields.`);
      }
      return {
        id: requiredString(proposal.id, `optimization proposal ${index + 1} ID`),
        title: requiredString(proposal.title, `optimization proposal ${index + 1} title`),
        summary: requiredString(proposal.summary, `optimization proposal ${index + 1} summary`),
        evidence: {
          metric: requiredString(evidence.metric, "optimization evidence metric"),
          window: requiredString(evidence.window, "optimization evidence window"),
          observation: requiredString(
            evidence.observation,
            "optimization evidence observation",
          ),
        },
        expectedOutcome: requiredString(
          proposal.expectedOutcome,
          "optimization expected outcome",
        ),
        risk: requiredString(proposal.risk, "optimization risk"),
        affectedFields,
      };
    }),
  };
};

const futureIso = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

export const createInitialCampaignPayload = (): CreateCampaignPayload => ({
  creationMode: "manual",
  campaign: {
    name: "",
    goal: "AWARENESS",
    platforms: [],
    configuration: {
      accountAssetIds: {},
      specialAdCategories: [],
      sameCreativeForAll: true,
      budgetOptimization: "audience_strategy",
    },
  },
  audienceStrategies: [createAudienceStrategy()],
});

export const createAudienceStrategy = (
  name = "Audience Strategy 1",
): AudienceStrategy => ({
  id: crypto.randomUUID(),
  name,
  configuration: {
    destination: "WEBSITE",
    optimizationGoal: "REACH",
    eventSourceIds: {},
  },
  audience: {
    locations: ["NG"],
    ageMin: 18,
    ageMax: 65,
    gender: "all",
    interests: [],
    includeAudienceIds: [],
    excludeAudienceIds: [],
    languages: [],
    devices: ["mobile"],
  },
  budget: {
    amount: 0,
    currency: "NGN",
    type: "daily",
    startDate: futureIso(30),
  },
  ads: [],
});

export const validateCampaignCreativeSetup = (
  payload: CampaignReviewPayload,
) => {
  for (const strategy of payload.audienceStrategies) {
    if (strategy.ads.length > 6) return `${strategy.name} can contain at most six ads.`;
    for (const platform of payload.campaign.platforms) {
      const ads = strategy.ads.filter((ad) => ad.platform === platform);
      const label = platform === "meta" ? "Meta" : "TikTok";
      if (!ads.length) return `Add at least one ${label} ad to ${strategy.name}.`;
      for (const ad of ads) {
        if (!ad.primaryText.trim()) return `Enter primary text for ${label}.`;
        if (!ad.mediaUrl.trim()) return `Upload media for ${label}.`;
        if (
          strategy.configuration.destination === "VIDEO" &&
          !ad.mediaUrl.includes("/video/upload/") &&
          !/\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i.test(ad.mediaUrl)
        ) return `Upload a video for ${label}.`;
        if (platform === "meta" && strategy.configuration.destination === "WEBSITE" && !ad.landingPageUrl?.trim()) {
          return "Enter a landing page URL for Meta.";
        }
        if (strategy.configuration.destination === "INSTANT_FORM" && !ad.leadFormId?.trim()) {
          return `Enter a lead form ID for ${label}.`;
        }
        if (payload.campaign.goal === "APP_PROMOTION" && !ad.appId?.trim()) return `Enter an app ID for ${label}.`;
      }
    }
  }
  return null;
};

export const validateCampaignPayload = (payload: CampaignReviewPayload) => {
  if (!payload.campaign.name.trim()) return "Enter a campaign name.";
  if (!payload.campaign.platforms.length) return "Select at least one platform.";
  if (!payload.audienceStrategies.length) return "Add an audience strategy.";
  for (const platform of payload.campaign.platforms) {
    if (!payload.campaign.configuration.accountAssetIds?.[platform]) {
      return `Select a ${platform === "meta" ? "Meta" : "TikTok"} ad account.`;
    }
  }
  for (const strategy of payload.audienceStrategies) {
    if (!strategy.name.trim()) return "Name every audience strategy.";
    if (strategy.configuration.optimizationGoal === "CONVERSIONS" && payload.campaign.platforms.some(
      (platform) => !strategy.configuration.eventSourceIds?.[platform],
    )) return `Select an event source for every platform in ${strategy.name}.`;
    if (!strategy.audience.locations.length) return `Select at least one country for ${strategy.name}.`;
    const ageMin = strategy.audience.ageMin ?? 18;
    const ageMax = strategy.audience.ageMax ?? 65;
    if (ageMin < 18 || ageMax > 65 || ageMin > ageMax) return "Audience age must stay between 18 and 65, with the minimum before the maximum.";
    if (hasRestrictedMetaTargeting(payload.campaign.configuration.specialAdCategories) &&
      (ageMin !== 18 || ageMax !== 65 || (strategy.audience.gender ?? "all") !== "all" || Boolean(strategy.audience.interests?.length))) {
      return "This Meta special ad category requires ages 18–65, all genders, and no interest targeting.";
    }
    if (!Number.isFinite(strategy.budget.amount) || strategy.budget.amount <= 0) return `Enter a budget greater than zero for ${strategy.name}.`;
    const start = new Date(strategy.budget.startDate);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) return `Choose a future start time for ${strategy.name}.`;
    if (strategy.budget.endDate) {
      const end = new Date(strategy.budget.endDate);
      if (Number.isNaN(end.getTime()) || end <= start) return `Choose an end time after the start time for ${strategy.name}.`;
    }
  }
  return validateCampaignCreativeSetup(payload);
};

export const validateCampaignDraftPayload = (payload: CampaignReviewPayload) => {
  if (!payload.campaign.name.trim()) return "Enter a campaign name before saving the draft.";
  if (!payload.audienceStrategies.length) return "Add an audience strategy before saving the draft.";
  if (payload.campaign.platforms.length > 2) return "A campaign can use at most two platforms.";
  for (const strategy of payload.audienceStrategies) {
    if (!strategy.name.trim()) return "Name every audience strategy before saving the draft.";
    const ageMin = strategy.audience.ageMin ?? 18;
    const ageMax = strategy.audience.ageMax ?? 65;
    if (ageMin < 18 || ageMax > 65 || ageMin > ageMax) return "Audience age must stay between 18 and 65, with the minimum before the maximum.";
    if (!Number.isFinite(strategy.budget.amount) || strategy.budget.amount < 0) return "Budget cannot be negative.";
    const start = new Date(strategy.budget.startDate);
    if (Number.isNaN(start.getTime())) return "Choose a valid start time.";
    if (strategy.budget.endDate) {
      const end = new Date(strategy.budget.endDate);
      if (Number.isNaN(end.getTime()) || end <= start) return "End time must be after the start time.";
    }
    if (strategy.ads.length > 6) return `${strategy.name} can contain at most six ads.`;
    if (strategy.ads.some((ad) => !payload.campaign.platforms.includes(ad.platform))) return "Every saved ad must belong to a selected platform.";
  }
  return null;
};

export const fetchMetaLeadForms = async (
  assetId: string,
  signal?: AbortSignal,
): Promise<MetaLeadFormsResponse> => {
  const params = new URLSearchParams({ assetId, limit: "100" });
  const res = await apiFetch(`/campaigns/lead-forms?${params.toString()}`, {
    method: "GET",
    signal,
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(
      getApiError(data, `Load Meta Instant Forms failed (${res.status})`),
    );
  }
  if (
    !isRecord(data) ||
    !isRecord(data.page) ||
    !isRecord(data.adAccount) ||
    !Array.isArray(data.forms) ||
    !isRecord(data.paging)
  ) {
    throw new Error("Meta returned an invalid Instant Form response.");
  }

  return {
    page: {
      id: requiredString(data.page.id, "Meta Page ID"),
      name: requiredString(data.page.name, "Meta Page name"),
    },
    adAccount: {
      assetId: requiredString(data.adAccount.assetId, "Meta account asset ID"),
      id: requiredString(data.adAccount.id, "Meta ad account ID"),
      name: requiredString(data.adAccount.name, "Meta ad account name"),
    },
    forms: data.forms.map((form, index) => {
      if (!isRecord(form)) {
        throw new Error(`Meta Instant Form ${index + 1} is invalid.`);
      }
      return {
        id: requiredString(form.id, "Meta Instant Form ID"),
        name: requiredString(form.name, "Meta Instant Form name"),
        status: requiredString(form.status, "Meta Instant Form status"),
        locale:
          optionalString(form.locale, "Meta Instant Form locale") ?? null,
      };
    }),
    paging: {
      nextCursor:
        optionalString(data.paging.nextCursor, "Meta Instant Form cursor") ??
        null,
    },
  };
};

export const startAiCampaignDraft = async (input: {
  prompt: string;
  brandName: string;
  currency?: CampaignCurrency;
  signal?: AbortSignal;
}): Promise<AiCampaignDraftResponse> => {
  const res = await apiFetch("/ai/campaign-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: input.prompt,
      brandName: input.brandName,
      currency: input.currency ?? "NGN",
    }),
    signal: input.signal,
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Start AI campaign failed (${res.status})`));
  }
  return parseAiCampaignDraftResponse(data);
};

export const answerAiCampaignQuestion = async (input: {
  draftId: string;
  revision: number;
  questionId: string;
  optionIds: string[];
  signal?: AbortSignal;
}): Promise<AiCampaignDraftResponse> => {
  const res = await apiFetch(
    `/ai/campaign-drafts/${encodeURIComponent(input.draftId)}/answers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revision: input.revision,
        questionId: input.questionId,
        optionIds: input.optionIds,
      }),
      signal: input.signal,
    },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Continue AI campaign failed (${res.status})`));
  }
  return parseAiCampaignDraftResponse(data);
};

export const reviseAiCampaignDraft = async (input: {
  draftId: string;
  revision: number;
  currentDraft: GeneratedCampaignDraft;
  targetStep?: AiCampaignStepId;
  instruction: string;
  lockedSteps: AiCampaignStepId[];
  messages: AiCampaignMessage[];
  signal?: AbortSignal;
}): Promise<AiCampaignDraftResponse> => {
  const res = await apiFetch(
    `/ai/campaign-drafts/${encodeURIComponent(input.draftId)}/revisions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revision: input.revision,
        currentDraft: input.currentDraft,
        targetStep: input.targetStep,
        instruction: input.instruction,
        lockedSteps: input.lockedSteps,
        messages: input.messages,
      }),
      signal: input.signal,
    },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Revise AI campaign failed (${res.status})`));
  }
  return parseAiCampaignDraftResponse(data);
};

export const requestCampaignAdvice = async (
  campaignId: string,
  prompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<CampaignAdviceResponse> => {
  const res = await apiFetch("/ai/campaign-advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, prompt, messages }),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(
      getApiError(data, "The campaign assistant could not answer right now."),
    );
  }
  const answer =
    data && typeof data === "object" && "answer" in data
      ? (data as { answer?: unknown }).answer
      : undefined;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("The campaign assistant returned an invalid response.");
  }
  return { answer: answer.trim() };
};

export const requestCampaignName = async (input: {
  brandName: string;
  currentName?: string;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
}): Promise<CampaignNameSuggestion> => {
  const res = await apiFetch("/ai/campaign-name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Generate campaign name failed (${res.status})`));
  }
  return parseCampaignNameSuggestion(data);
};

export const parseCampaignNameSuggestion = (
  data: unknown,
): CampaignNameSuggestion => {
  if (!isRecord(data)) {
    throw new Error("The AI naming service returned an invalid response.");
  }
  const name = requiredString(data.name, "campaign name suggestion");
  if (name.length > 60) {
    throw new Error(
      "The AI naming service returned a name longer than 60 characters.",
    );
  }
  if (name.includes("_")) {
    throw new Error(
      "The AI naming service returned an internal code instead of a campaign title.",
    );
  }
  if (/[A-Za-z]/.test(name) && name === name.toUpperCase()) {
    throw new Error(
      "The AI naming service returned an all-caps label instead of a campaign title.",
    );
  }
  return {
    name,
    rationale: requiredString(data.rationale, "campaign name rationale"),
  };
};

export const requestCampaignCreativeSuggestion = async (
  campaignId: string,
  input: {
    platform: CampaignPlatform;
    field: "headline" | "caption";
    currentValue: string;
    headline?: string;
    caption?: string;
  },
): Promise<CampaignCreativeSuggestion> => {
  const res = await apiFetch(
    `/ai/campaigns/${encodeURIComponent(campaignId)}/creative-suggestions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Generate creative suggestion failed (${res.status})`));
  }
  if (!isRecord(data)) {
    throw new Error("The AI creative service returned an invalid response.");
  }
  const field = enumValue(data.field, ["headline", "caption"], "creative suggestion field");
  if (field !== input.field) {
    throw new Error("The AI creative service returned a suggestion for the wrong field.");
  }
  const value = requiredString(data.value, "creative suggestion");
  const limit = field === "headline" ? 255 : 2_200;
  if (value.length > limit) {
    throw new Error(`The AI creative service returned ${field} text over ${limit} characters.`);
  }
  return {
    field,
    value,
    rationale: requiredString(data.rationale, "creative suggestion rationale"),
  };
};

export const fetchCampaignOptimizations = async (
  campaignId: string,
  signal?: AbortSignal,
): Promise<CampaignOptimizationResponse> => {
  const res = await apiFetch(
    `/ai/campaigns/${encodeURIComponent(campaignId)}/optimizations`,
    { method: "GET", signal },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Load campaign optimizations failed (${res.status})`));
  }
  return parseCampaignOptimizationResponse(data);
};

export const requestCampaignOptimizations = async (
  campaignId: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<CampaignOptimizationResponse> => {
  const res = await apiFetch(
    `/ai/campaigns/${encodeURIComponent(campaignId)}/optimizations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal,
    },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(
      getApiError(data, `Generate campaign optimizations failed (${res.status})`),
    );
  }
  return parseCampaignOptimizationResponse(data);
};

export const applyCampaignOptimizations = async (input: {
  campaignId: string;
  revision: number;
  proposalIds: string[];
  idempotencyKey: string;
}): Promise<CampaignDto> => {
  const res = await apiFetch(
    `/ai/campaigns/${encodeURIComponent(input.campaignId)}/optimizations/apply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        revision: input.revision,
        proposalIds: input.proposalIds,
      }),
    },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Apply campaign optimizations failed (${res.status})`));
  }
  const campaign = isRecord(data) && isRecord(data.campaign) ? data.campaign : data;
  if (!isRecord(campaign) || typeof campaign.id !== "string") {
    throw new Error("Apply campaign optimizations returned an invalid campaign.");
  }
  return campaign as unknown as CampaignDto;
};

export const searchMetaInterests = async (
  query: string,
): Promise<MetaInterest[]> => {
  const res = await apiFetch(
    `/campaigns/get-interests?interest=${encodeURIComponent(query)}`,
    { method: "GET" },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Interest search failed (${res.status})`));
  }
  if (!Array.isArray(data?.interests)) {
    throw new Error("Interest search returned an invalid response shape");
  }
  return data.interests as MetaInterest[];
};

export const forecastCampaignReach = async (input: {
  goal: CampaignGoal;
  accountAssetId?: string;
  audience: AudienceStrategy["audience"];
}): Promise<AudienceReachForecast> => {
  const res = await apiFetch("/campaigns/reach-forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Reach forecast failed (${res.status})`));
  }
  const forecast = data?.forecast;
  if (
    !forecast ||
    typeof forecast.upper !== "number" ||
    typeof forecast.ready !== "boolean" ||
    forecast.source !== "meta"
  ) {
    throw new Error("Reach forecast returned an invalid response shape");
  }
  return forecast as AudienceReachForecast;
};

export const fetchCampaignEventSources = async (
  platform: CampaignPlatform,
  assetId: string,
): Promise<CampaignEventSource[]> => {
  const res = await apiFetch(
    `/campaigns/event-sources?platform=${platform}&assetId=${encodeURIComponent(assetId)}`,
    { method: "GET" },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(
      getApiError(data, `Load ${platform} event sources failed (${res.status})`),
    );
  }
  if (!Array.isArray(data)) {
    throw new Error("Event sources returned an invalid response shape");
  }
  return data as CampaignEventSource[];
};

export const searchProviderLanguages = async (
  platform: CampaignPlatform,
  assetId: string,
  query: string,
): Promise<ProviderLanguage[]> => {
  const params = new URLSearchParams({ platform, assetId, query });
  const res = await apiFetch(`/campaigns/languages?${params.toString()}`, {
    method: "GET",
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(
      getApiError(data, `Load ${platform} languages failed (${res.status})`),
    );
  }
  if (!Array.isArray(data)) {
    throw new Error("Languages returned an invalid response shape");
  }
  return data as ProviderLanguage[];
};

const serializeCampaignPayload = (
  payload: CreateCampaignPayload,
): CreateCampaignPayload => {
  return {
    ...payload,
    campaign: {
      ...payload.campaign,
      name: payload.campaign.name.trim(),
      configuration: payload.campaign.configuration,
    },
    audienceStrategies: payload.audienceStrategies.map((strategy) => ({
      ...strategy,
      name: strategy.name.trim(),
      audience: {
        ...strategy.audience,
        locations: [...new Set(strategy.audience.locations.map((item) => item.trim()))].filter(Boolean),
        interests: [...new Set((strategy.audience.interests ?? []).map((item) => item.trim()))].filter(Boolean),
        languages: [...new Set((strategy.audience.languages ?? []).map((item) => item.trim()))].filter(Boolean),
      },
      budget: { ...strategy.budget, endDate: strategy.budget.endDate || undefined },
      ads: strategy.ads.map((ad) => ({
        ...ad,
        primaryText: ad.primaryText.trim(),
        headline: ad.headline?.trim() || undefined,
        mediaUrl: ad.mediaUrl.trim(),
        landingPageUrl: ad.landingPageUrl?.trim() || undefined,
        appId: ad.appId?.trim() || undefined,
        leadFormId: ad.leadFormId?.trim() || undefined,
      })),
    })),
  };
};

export const createCampaign = async (
  payload: CreateCampaignPayload,
  options?: { idempotencyKey?: string },
): Promise<CampaignDto> => {
  const res = await apiFetch("/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : {}),
    },
    body: JSON.stringify(serializeCampaignPayload(payload)),
  });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(getApiError(data, `Create campaign failed (${res.status})`));
  }

  return data as CampaignDto;
};

export const createCampaignDraft = async (
  payload: CreateCampaignPayload,
  options?: { idempotencyKey?: string },
): Promise<CampaignDto> => {
  const res = await apiFetch("/campaigns/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : {}),
    },
    body: JSON.stringify(serializeCampaignPayload(payload)),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Save campaign draft failed (${res.status})`));
  }
  return data as CampaignDto;
};

export const fetchCampaigns = async (): Promise<CampaignDto[]> => {
  const res = await apiFetch("/campaigns", { method: "GET" });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(getApiError(data, `Fetch campaigns failed (${res.status})`));
  }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.campaigns)) return data.campaigns;
  if (Array.isArray(data?.data)) return data.data;

  throw new Error("Fetch campaigns returned an invalid response shape");
};

export const fetchCampaignById = async (id: string): Promise<CampaignDto> => {
  const res = await apiFetch(`/campaigns/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(getApiError(data, `Fetch campaign failed (${res.status})`));
  }
  if (data?.id) return data as CampaignDto;
  if (data?.data?.id) return data.data as CampaignDto;

  throw new Error("Fetch campaign returned an invalid response shape");
};

export const fetchCampaignMetrics = async (): Promise<CampaignMetrics> => {
  const res = await apiFetch("/campaigns/metrics", { method: "GET" });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(
      getApiError(data, `Fetch campaign metrics failed (${res.status})`),
    );
  }
  if (data?.summary && Array.isArray(data?.campaigns)) return data;
  if (data?.data?.summary && Array.isArray(data?.data?.campaigns)) {
    return data.data;
  }

  throw new Error("Fetch campaign metrics returned an invalid response shape");
};

export const updateCampaign = async (
  id: string,
  payload: CreateCampaignPayload,
): Promise<CampaignDto> => {
  const res = await apiFetch(`/campaigns/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeCampaignPayload(payload)),
  });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(getApiError(data, `Update campaign failed (${res.status})`));
  }

  return data as CampaignDto;
};

export const updateCampaignDraft = async (
  id: string,
  payload: CreateCampaignPayload,
): Promise<CampaignDto> => {
  const res = await apiFetch(`/campaigns/drafts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeCampaignPayload(payload)),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Save campaign draft failed (${res.status})`));
  }
  return data as CampaignDto;
};

export const publishCampaign = async (
  id: string,
  options?: { idempotencyKey?: string },
): Promise<CampaignDto> => {
  const res = await apiFetch(`/campaigns/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    headers: options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined,
  });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(getApiError(data, `Publish campaign failed (${res.status})`));
  }

  return data as CampaignDto;
};

export const campaignDtoToPayload = (
  campaign: CampaignDto,
): CampaignReviewPayload => ({
  creationMode: campaign.creationMode ?? "unknown",
  campaign: {
    name: campaign.name,
    goal: campaign.goal,
    platforms: campaign.platforms,
    configuration: campaign.configuration,
  },
  audienceStrategies: campaign.audienceStrategies.map((strategy) => ({
    ...strategy,
    ads: (campaign.creatives ?? []).filter((ad) => ad.audienceStrategyId === strategy.id).map((ad) => ({
      platform: ad.platform,
      primaryText: ad.primaryText,
      headline: ad.headline,
      cta: ad.cta,
      mediaUrl: ad.mediaUrl,
      landingPageUrl: ad.landingPageUrl,
      appId: ad.appId,
      leadFormId: ad.leadFormId,
    })),
  })),
});
