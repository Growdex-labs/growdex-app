import { apiFetch } from "./auth";

export type CampaignGoal =
  | "AWARENESS"
  | "TRAFFIC"
  | "ENGAGEMENT"
  | "SALES"
  | "LEADS"
  | "APP_PROMOTION";

export type CampaignPlatform = "meta" | "tiktok";
export type CampaignGender = "all" | "male" | "female";
export type BudgetType = "daily" | "lifetime";
export type CampaignCurrency = "NGN" | "USD";
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
  primaryText: string;
  headline?: string;
  cta: CampaignCta;
  mediaUrl: string;
  landingPageUrl?: string;
  appId?: string;
  leadFormId?: string;
}

export interface CreateCampaignPayload {
  creationMode: "manual";
  campaign: {
    name: string;
    goal: CampaignGoal;
    platforms: CampaignPlatform[];
  };
  audience: {
    locations: string[];
    ageMin?: number;
    ageMax?: number;
    gender?: CampaignGender;
    interests?: string[];
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

export interface CampaignCreativeDto extends CampaignCreativeInput {
  id: string;
  reviewStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface CampaignDto {
  id: string;
  name: string;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  targeting: CreateCampaignPayload["audience"];
  budget: CreateCampaignPayload["budget"];
  creatives?: CampaignCreativeDto[];
  status?: string;
  publishError?: string | null;
  createdAt?: string;
}

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
): CreateCampaignPayload => ({
  creationMode: "manual",
  campaign: {
    name: campaign.name,
    goal: campaign.goal,
    platforms: campaign.platforms,
  },
  audience: campaign.targeting,
  budget: campaign.budget,
  adContent: {
    creatives: (campaign.creatives ?? []).map((creative) => ({
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
