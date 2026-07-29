import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./auth";
import { savePersonalInfo } from "./onboarding";

vi.mock("./auth", () => ({ apiFetch: vi.fn() }));

describe("savePersonalInfo", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("sends organization size as the numeric string required by the API", async () => {
    await savePersonalInfo({
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Analytical Engines",
      organizationSize: 0,
      industry: "Software & Technology",
      monthlyBudget: "1000-5000",
    });

    expect(apiFetch).toHaveBeenCalledOnce();
    const [, request] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(request?.body as string)).toMatchObject({
      organizationSize: "0",
    });
  });
});
