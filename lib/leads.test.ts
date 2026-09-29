import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock("./auth", () => ({ apiFetch }));
import { createLead, deleteLead, fetchLead, fetchLeads, fetchLeadSummary, syncMetaInstantFormLeads, updateLead } from "./leads";

const lead = { id: "lead-1", name: "Ada", email: "ada@example.com", status: "new", value: "1250.50", createdAt: "2026-09-29T10:00:00.000Z" };

describe("leads API", () => {
  beforeEach(() => apiFetch.mockReset());

  it("lists leads with encoded filters and normalizes decimal values", async () => {
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ data: { leads: [lead], total: 1, page: 1, limit: 20 } })));
    const result = await fetchLeads({ search: "Ada & Co", status: "new", page: 1, limit: 20 });
    expect(apiFetch).toHaveBeenCalledWith("/leads?search=Ada+%26+Co&status=new&page=1&limit=20", { method: "GET" });
    expect(result.leads[0].value).toBe(1250.5);
  });

  it("loads normalized summary totals", async () => {
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ data: { total: "4", converted: 2, totalValue: "9000" } })));
    await expect(fetchLeadSummary()).resolves.toMatchObject({ total: 4, converted: 2, totalValue: 9000, new: 0 });
  });

  it("preserves backend pagination when data is the list envelope", async () => {
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ data: [lead], pagination: { total: 81, page: 2, limit: 20 } })));
    await expect(fetchLeads({ page: 2, limit: 20 })).resolves.toMatchObject({ total: 81, page: 2, limit: 20 });
  });

  it("loads one lead and normalizes database field casing", async () => {
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ data: { ...lead, status: "QUALIFIED", campaign_id: "campaign-1", createdAt: undefined, created_at: lead.createdAt } })));
    await expect(fetchLead("lead/1")).resolves.toMatchObject({ status: "qualified", campaignId: "campaign-1", createdAt: lead.createdAt });
    expect(apiFetch).toHaveBeenCalledWith("/leads/lead%2F1", { method: "GET" });
  });

  it("creates and updates leads through authenticated requests", async () => {
    apiFetch.mockImplementation(async () => new Response(JSON.stringify({ data: lead })));
    await createLead({ name: "Ada", email: "ada@example.com", value: 1250.5 });
    expect(apiFetch).toHaveBeenLastCalledWith("/leads", expect.objectContaining({ method: "POST" }));
    await updateLead("lead/1", { status: "qualified" });
    expect(apiFetch).toHaveBeenLastCalledWith("/leads/lead%2F1", expect.objectContaining({ method: "PATCH" }));
  });

  it("explains when LeadsModule is missing from the deployed backend", async () => {
    apiFetch.mockResolvedValue(new Response("Cannot GET /leads", { status: 404 }));
    await expect(fetchLeads()).rejects.toThrow("Deploy and register LeadsModule");
  });

  it("syncs Meta Instant Form submissions through the backend", async () => {
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ data: { created: 3, updated: 1, skipped: 2 } })));
    await expect(syncMetaInstantFormLeads()).resolves.toEqual({ imported: 3, updated: 1, skipped: 2 });
    expect(apiFetch).toHaveBeenCalledWith("/leads/sync/meta", { method: "POST" });
  });

  it("deletes a lead through the authenticated backend", async () => {
    apiFetch.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(deleteLead("lead/1")).resolves.toBeUndefined();
    expect(apiFetch).toHaveBeenCalledWith("/leads/lead%2F1", { method: "DELETE" });
  });
});
