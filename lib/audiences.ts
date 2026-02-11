import { apiFetch } from "./auth";

export interface MetaConfig {
  ageMin?: number;
  ageMax?: number;
  gender?: string;
}

export interface TiktokConfig {
  ageRanges?: string[];
  gender?: string;
}

export interface CreateAudiencePayload {
  name: string;
  country?: string[];
  locations?: string[];
  interests?: string[];
  platforms?: Array<"meta" | "tiktok">;
  metaConfig?: MetaConfig;
  tiktokConfig?: TiktokConfig;
}

export interface Audience {
  id: string;
  name: string;
  country?: string[];
  locations?: string[];
  interests?: string[];
  platforms?: Array<"meta" | "tiktok">;
  metaConfig?: MetaConfig;
  tiktokConfig?: TiktokConfig;
}

export const createAudience = async (payload: CreateAudiencePayload) => {
  const res = await apiFetch("/audiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create audience failed (${res.status}): ${text}`);
  }

  return res.json();
};

export const fetchAudiences = async (): Promise<Audience[]> => {
  const res = await apiFetch("/audiences", {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch audiences failed (${res.status}): ${text}`);
  }

  return res.json();
};

export default createAudience;
