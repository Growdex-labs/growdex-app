import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock("./auth", () => ({ apiFetch }));
import { createLead, fetchLeads, fetchLeadSummary, syncMetaInstantFormLeads, updateLead } from "./leads";

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
});
