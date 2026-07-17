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
export type CampaignCurrency = "NGN" | "USD";
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
  destination: CampaignDestination;
  optimizationGoal: CampaignOptimizationGoal;
  accountAssetIds?: Partial<Record<CampaignPlatform, string>>;
  eventSourceIds?: Partial<Record<CampaignPlatform, string>>;
  sameCreativeForAll: boolean;
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

export interface CreateCampaignPayload {
  creationMode: CampaignCreationMode;
  campaign: {
    name: string;
    goal: CampaignGoal;
    platforms: CampaignPlatform[];
    configuration: CampaignConfiguration;
  };
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
  adContent: {
    creatives: CampaignCreativeInput[];
  };
}

export interface GeneratedCampaignDraft {
  name: string;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  configuration: Pick<
    CampaignConfiguration,
    "destination" | "optimizationGoal"
  >;
  audience: CreateCampaignPayload["audience"];
  budget: {
    amount: number;
    currency: CampaignCurrency;
    type: BudgetType;
    durationDays: number;
    startDateLocal?: string | null;
    endDateLocal?: string | null;
  };
  creative: Omit<
    CampaignCreativeInput,
    "platform" | "mediaUrl" | "landingPageUrl"
  > & {
    mediaUrl?: string | null;
    landingPageUrl?: string | null;
  };
  rationale: string;
  stepRationales: Record<
    "setup" | "goal" | "platforms" | "audience" | "budget" | "creative",
    string
  >;
}

export interface CampaignCreativeDto extends CampaignCreativeInput {
  id: string;
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
  targeting: CreateCampaignPayload["audience"];
  budget: CreateCampaignPayload["budget"];
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

const futureIso = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

export const createInitialCampaignPayload = (): CreateCampaignPayload => ({
  creationMode: "manual",
  campaign: {
    name: "",
    goal: "AWARENESS",
    platforms: [],
    configuration: {
      destination: "WEBSITE",
      optimizationGoal: "REACH",
      accountAssetIds: {},
      eventSourceIds: {},
      sameCreativeForAll: true,
    },
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
  adContent: { creatives: [] },
});

export const validateCampaignPayload = (payload: CampaignReviewPayload) => {
  if (!payload.campaign.name.trim()) return "Enter a campaign name.";
  if (!payload.campaign.platforms.length) return "Select at least one platform.";
  for (const platform of payload.campaign.platforms) {
    if (!payload.campaign.configuration.accountAssetIds?.[platform]) {
      return `Select a ${platform === "meta" ? "Meta" : "TikTok"} ad account.`;
    }
  }
  if (
    payload.campaign.configuration.optimizationGoal === "CONVERSIONS" &&
    payload.campaign.platforms.some(
      (platform) => !payload.campaign.configuration.eventSourceIds?.[platform],
    )
  ) {
    return "Select an event source for every conversion platform.";
  }
  if (!payload.audience.locations.length) return "Select at least one country.";
  const ageMin = payload.audience.ageMin ?? 18;
  const ageMax = payload.audience.ageMax ?? 65;
  if (ageMin < 18 || ageMax > 65 || ageMin > ageMax) {
    return "Audience age must stay between 18 and 65, with the minimum before the maximum.";
  }
  if (!Number.isFinite(payload.budget.amount) || payload.budget.amount <= 0) {
    return "Enter a budget greater than zero.";
  }
  const start = new Date(payload.budget.startDate);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
    return "Choose a start time in the future.";
  }
  if (payload.budget.endDate) {
    const end = new Date(payload.budget.endDate);
    if (Number.isNaN(end.getTime()) || end <= start) {
      return "End time must be after the start time.";
    }
  }
  if (payload.adContent.creatives.length !== payload.campaign.platforms.length) {
    return "Add one creative for every selected platform.";
  }
  for (let index = 0; index < payload.campaign.platforms.length; index += 1) {
    const platform = payload.campaign.platforms[index];
    const creative = payload.adContent.creatives[index];
    const label = platform === "meta" ? "Meta" : "TikTok";
    if (creative?.platform !== platform) return `${label} creative is assigned to the wrong platform.`;
    if (!creative?.primaryText.trim()) return `Enter primary text for ${label}.`;
    if (!creative.mediaUrl.trim()) return `Upload media for ${label}.`;
    if (
      platform === "meta" &&
      payload.campaign.configuration.destination !== "INSTANT_FORM" &&
      !creative.landingPageUrl?.trim()
    ) {
      return "Enter a landing page URL for Meta.";
    }
    if (
      payload.campaign.configuration.destination === "INSTANT_FORM" &&
      !creative.leadFormId?.trim()
    ) {
      return `Enter a lead form ID for ${label}.`;
    }
    if (payload.campaign.goal === "APP_PROMOTION" && !creative.appId?.trim()) {
      return `Enter an app ID for ${label}.`;
    }
  }
  return null;
};

export const generateCampaignDraft = async (input: {
  prompt: string;
  brandName: string;
  currency?: CampaignCurrency;
}): Promise<GeneratedCampaignDraft> => {
  const res = await apiFetch("/ai/generate-campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, currency: input.currency ?? "NGN" }),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(getApiError(data, `Generate campaign failed (${res.status})`));
  }
  return data as GeneratedCampaignDraft;
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
  audience: CreateCampaignPayload["audience"];
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
): CreateCampaignPayload => ({
  ...payload,
  campaign: {
    ...payload.campaign,
    name: payload.campaign.name.trim(),
  },
  audience: {
    ...payload.audience,
    locations: [...new Set(payload.audience.locations.map((item) => item.trim()))].filter(Boolean),
    interests: [...new Set((payload.audience.interests ?? []).map((item) => item.trim()))].filter(Boolean),
    languages: [...new Set((payload.audience.languages ?? []).map((item) => item.trim()))].filter(Boolean),
  },
  budget: {
    ...payload.budget,
    endDate: payload.budget.endDate || undefined,
  },
  adContent: {
    creatives: payload.adContent.creatives.map((creative) => ({
      ...creative,
      primaryText: creative.primaryText.trim(),
      headline: creative.headline?.trim() || undefined,
      mediaUrl: creative.mediaUrl.trim(),
      landingPageUrl: creative.landingPageUrl?.trim() || undefined,
      appId: creative.appId?.trim() || undefined,
      leadFormId: creative.leadFormId?.trim() || undefined,
    })),
  },
});

export const createCampaign = async (
  payload: CreateCampaignPayload,
): Promise<CampaignDto> => {
  const res = await apiFetch("/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeCampaignPayload(payload)),
  });
  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(getApiError(data, `Create campaign failed (${res.status})`));
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

export const publishCampaign = async (id: string): Promise<CampaignDto> => {
  const res = await apiFetch(`/campaigns/${encodeURIComponent(id)}/publish`, {
    method: "POST",
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
  audience: campaign.targeting,
  budget: campaign.budget,
  adContent: {
    creatives: (campaign.creatives ?? []).map((creative) => ({
      platform: creative.platform,
      primaryText: creative.primaryText,
      headline: creative.headline,
      cta: creative.cta,
      mediaUrl: creative.mediaUrl,
      landingPageUrl: creative.landingPageUrl,
      appId: creative.appId,
      leadFormId: creative.leadFormId,
    })),
  },
});
