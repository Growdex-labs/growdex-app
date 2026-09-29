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

const errorMessage = async (response: Response, action: string) =>
  readResponseError(response, `${action} (${response.status}).`);

const unwrap = (body: unknown): unknown => {
  if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
};

const normalizeLead = (value: unknown): Lead => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The leads API returned an invalid lead.");
  }
  const lead = value as Record<string, unknown>;
  if (typeof lead.id !== "string" || typeof lead.name !== "string" || typeof lead.email !== "string") {
    throw new Error("The leads API returned an invalid lead.");
  }
  const status = LEAD_STATUSES.includes(lead.status as LeadStatus)
    ? (lead.status as LeadStatus)
    : "new";
  const numericValue = Number(lead.value ?? 0);
  return {
    ...(lead as unknown as Lead),
    status,
    value: Number.isFinite(numericValue) ? numericValue : 0,
    createdAt: typeof lead.createdAt === "string" ? lead.createdAt : new Date(0).toISOString(),
  };
};

export async function fetchLeads(params: ListLeadsParams = {}): Promise<LeadList> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status) query.set("status", params.status);
  if (params.campaignId) query.set("campaignId", params.campaignId);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 50));
  const response = await apiFetch(`/leads?${query.toString()}`, { method: "GET" });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not load leads"));
  const payload = unwrap(await response.json());
  if (Array.isArray(payload)) {
    const leads = payload.map(normalizeLead);
    return { leads, total: leads.length, page: 1, limit: leads.length };
  }
  if (!payload || typeof payload !== "object") throw new Error("The leads API returned an invalid list.");
  const result = payload as Record<string, unknown>;
  const rows = Array.isArray(result.leads) ? result.leads : Array.isArray(result.items) ? result.items : [];
  return {
    leads: rows.map(normalizeLead),
    total: Number(result.total ?? rows.length),
    page: Number(result.page ?? params.page ?? 1),
    limit: Number(result.limit ?? params.limit ?? 50),
  };
}

export async function fetchLeadSummary(): Promise<LeadSummary> {
  const response = await apiFetch("/leads/summary", { method: "GET" });
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
  const response = await apiFetch("/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not create lead"));
  return normalizeLead(unwrap(await response.json()));
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<Lead> {
  const response = await apiFetch(`/leads/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not update lead"));
  return normalizeLead(unwrap(await response.json()));
}

export async function deleteLead(id: string): Promise<void> {
  const response = await apiFetch(`/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await errorMessage(response, "Could not delete lead"));
}
