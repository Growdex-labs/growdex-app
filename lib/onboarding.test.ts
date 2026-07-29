import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./auth";
import { savePersonalInfo } from "./onboarding";

vi.mock("./auth", () => ({ apiFetch: vi.fn() }));

describe("savePersonalInfo", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("does not invent an organization size that onboarding never collects", async () => {
    await savePersonalInfo({
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Analytical Engines",
      industry: "Software & Technology",
      monthlyBudget: "1000-5000",
    });

    expect(apiFetch).toHaveBeenCalledOnce();
    const [, request] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(request?.body as string)).not.toHaveProperty(
      "organizationSize",
    );
  });
});
