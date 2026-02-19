import { apiFetch } from "./auth";

export type CampaignGoal =
  | "AWARENESS"
  | "TRAFFIC"
  | "CONVERSIONS"
  | "SALES"
  | "LEADS";

export type CampaignPlatform = "meta" | "tiktok";

export type CampaignGender = "all" | "male" | "female";

export type BudgetType = "daily" | "lifetime";

export interface CreateCampaignPayload {
  name: string;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  targeting: {
    locations: string[];
    ageMin: number;
    ageMax: number;
    gender: CampaignGender;
    interests: string[];
  };
  budget: {
    amount: number;
    currency: string;
    type: BudgetType;
    startDate: string;
    endDate: string;
  };
  creatives: Array<{
    primaryText: string;
    headline: string;
    cta: string;
    mediaUrl: string;
  }>;
}

export interface CampaignDto {
  id: string;
  name: string;
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  targeting?: {
    locations?: string[];
    ageMin?: number;
    ageMax?: number;
    gender?: CampaignGender;
    interests?: string[];
  };
  budget?: {
    amount?: number;
    currency?: string;
    type?: BudgetType;
    startDate?: string;
    endDate?: string;
  };
  status?: string;
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

export const createCampaign = async (payload: CreateCampaignPayload) => {
  const res = await apiFetch("/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create campaign failed (${res.status}): ${text}`);
  }

  return res.json();
};

export const fetchCampaigns = async (): Promise<CampaignDto[]> => {
  const res = await apiFetch("/campaigns", { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch campaigns failed (${res.status}): ${text}`);
  }

  return res.json();
};

export const fetchCampaignById = async (id: string): Promise<CampaignDto> => {
  const res = await apiFetch(`/campaigns/${encodeURIComponent(id)}`, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch campaign by id failed (${res.status}): ${text}`);
  }

  return res.json();
};

export const fetchCampaignMetrics = async (): Promise<CampaignMetrics> => {
  const res = await apiFetch("/campaigns/metrics", { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch campaign metrics failed (${res.status}): ${text}`);
  }

  return res.json();
};
