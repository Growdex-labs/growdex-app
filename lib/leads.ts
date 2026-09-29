import { readResponseError } from "./api-error";
import { apiFetch } from "./auth";

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  userId?: string;
  campaignId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  status: LeadStatus;
  value: number;
  currency?: string | null;
  createdAt: string;
  updatedAt?: string;
  campaign?: { id: string; name: string } | null;
}

export interface LeadSummary {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  totalValue: number;
}

export interface ListLeadsParams {
  search?: string;
  status?: LeadStatus;
  campaignId?: string;
  page?: number;
  limit?: number;
}

export interface LeadList {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  campaignId?: string;
  status?: LeadStatus;
  value?: number;
  currency?: string;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export interface MetaLeadSyncResult {
  imported: number;
  updated: number;
  skipped: number;
}

/**
 * Keep the route configurable because some Growdex deployments mount feature
 * modules below a versioned prefix (for example `/api/v1/leads`). The default
 * matches `@Controller("leads")` in the backend LeadsModule.
 */
const LEADS_API_PATH = (process.env.NEXT_PUBLIC_LEADS_API_PATH || "/leads").replace(/\/$/, "");

const errorMessage = async (response: Response, action: string) => {
  if (response.status === 404) {
    return "The Leads API is not available on this backend deployment. Deploy and register LeadsModule, or set NEXT_PUBLIC_LEADS_API_PATH to its mounted route.";
  }
  return readResponseError(response, `${action} (${response.status}).`);
};

const unwrap = (body: unknown): unknown => {
  if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const normalizeLead = (value: unknown): Lead => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The leads API returned an invalid lead.");
  }
  const lead = value as Record<string, unknown>;
  if (typeof lead.id !== "string" || typeof lead.name !== "string" || typeof lead.email !== "string") {
    throw new Error("The leads API returned an invalid lead.");
  }
  const normalizedStatus = typeof lead.status === "string"
    ? lead.status.toLowerCase()
    : "new";
  const status = LEAD_STATUSES.includes(normalizedStatus as LeadStatus)
    ? (normalizedStatus as LeadStatus)
    : "new";
  const numericValue = Number(lead.value ?? 0);
  return {
    ...(lead as unknown as Lead),
    status,
    value: Number.isFinite(numericValue) ? numericValue : 0,
    campaignId: typeof lead.campaignId === "string"
      ? lead.campaignId
      : typeof lead.campaign_id === "string" ? lead.campaign_id : null,
    createdAt: typeof lead.createdAt === "string"
      ? lead.createdAt
      : typeof lead.created_at === "string" ? lead.created_at : new Date(0).toISOString(),
    updatedAt: typeof lead.updatedAt === "string"
      ? lead.updatedAt
      : typeof lead.updated_at === "string" ? lead.updated_at : undefined,
  };
};

const parseLeadList = (body: unknown, params: ListLeadsParams): LeadList => {
  const envelope = asRecord(body);
  const unwrapped = unwrap(body);

  if (Array.isArray(unwrapped)) {
    const pagination = asRecord(envelope?.pagination) ?? asRecord(envelope?.meta);
    const leads = unwrapped.map(normalizeLead);
    return {
      leads,
      total: Number(envelope?.total ?? pagination?.total ?? leads.length),
      page: Number(envelope?.page ?? pagination?.page ?? params.page ?? 1),
      limit: Number(envelope?.limit ?? pagination?.limit ?? params.limit ?? 50),
    };
  }

  const result = asRecord(unwrapped);
  if (!result) throw new Error("The leads API returned an invalid list.");
  const rows = Array.isArray(result.leads)
    ? result.leads
    : Array.isArray(result.items) ? result.items : [];
  const pagination = asRecord(result.pagination) ?? asRecord(result.meta);
  return {
    leads: rows.map(normalizeLead),
    total: Number(result.total ?? pagination?.total ?? rows.length),
    page: Number(result.page ?? pagination?.page ?? params.page ?? 1),
    limit: Number(result.limit ?? pagination?.limit ?? params.limit ?? 50),
  };
};

export async function fetchLeads(params: ListLeadsParams = {}): Promise<LeadList> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status) query.set("status", params.status);
  if (params.campaignId) query.set("campaignId", params.campaignId);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 50));
  const response = await apiFetch(`${LEADS_API_PATH}?${query.toString()}`, { method: "GET" });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not load leads"));
  return parseLeadList(await response.json(), params);
}

export async function fetchLead(id: string): Promise<Lead> {
  const response = await apiFetch(`${LEADS_API_PATH}/${encodeURIComponent(id)}`, { method: "GET" });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not load lead"));
  return normalizeLead(unwrap(await response.json()));
}

export async function fetchLeadSummary(): Promise<LeadSummary> {
  const response = await apiFetch(`${LEADS_API_PATH}/summary`, { method: "GET" });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not load lead totals"));
  const raw = unwrap(await response.json()) as Partial<Record<keyof LeadSummary | "byStatus", unknown>>;
  const byStatus = raw?.byStatus && typeof raw.byStatus === "object"
    ? raw.byStatus as Partial<Record<LeadStatus, unknown>>
    : {};
  return Object.fromEntries(
    ["total", "new", "contacted", "qualified", "converted", "lost", "totalValue"].map((key) => [
      key,
      Number(raw?.[key as keyof LeadSummary] ?? byStatus[key as LeadStatus] ?? 0),
    ]),
  ) as unknown as LeadSummary;
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  const response = await apiFetch(LEADS_API_PATH, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not create lead"));
  return normalizeLead(unwrap(await response.json()));
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<Lead> {
  const response = await apiFetch(`${LEADS_API_PATH}/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not update lead"));
  return normalizeLead(unwrap(await response.json()));
}

export async function deleteLead(id: string): Promise<void> {
  const response = await apiFetch(`${LEADS_API_PATH}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not delete lead"));
}

/**
 * Ask the backend to pull submissions from the Meta Instant Forms connected to
 * the current user's campaigns. Meta access tokens remain server-side.
 */
export async function syncMetaInstantFormLeads(): Promise<MetaLeadSyncResult> {
  const response = await apiFetch(`${LEADS_API_PATH}/sync/meta`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await errorMessage(response, "Could not sync Meta Instant Form leads"));
  }
  const raw = unwrap(await response.json());
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("The Meta lead sync returned an invalid response.");
  }
  const result = raw as Record<string, unknown>;
  return {
    imported: Number(result.imported ?? result.created ?? 0),
    updated: Number(result.updated ?? 0),
    skipped: Number(result.skipped ?? 0),
  };
}
