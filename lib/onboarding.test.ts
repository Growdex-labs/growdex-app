import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./auth";
import { savePersonalInfo } from "./onboarding";

vi.mock("./auth", () => ({ apiFetch: vi.fn() }));

const sentBody = () => {
  const [, request] = vi.mocked(apiFetch).mock.calls[0];
  return JSON.parse(request?.body as string);
};

describe("savePersonalInfo", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("sends the chosen organization size as the numeric string the API expects", async () => {
    await savePersonalInfo({
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Analytical Engines",
      organizationSize: "200",
      industry: "Software & Technology",
      monthlyBudget: "1000-5000",
    });

    expect(apiFetch).toHaveBeenCalledOnce();
    expect(sentBody()).toMatchObject({ organizationSize: "200" });
  });

  it("omits organization size when it is left unanswered", async () => {
    await savePersonalInfo({
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Analytical Engines",
      industry: "Software & Technology",
      monthlyBudget: "1000-5000",
    });

    expect(apiFetch).toHaveBeenCalledOnce();
    expect(sentBody()).not.toHaveProperty("organizationSize");
  });
});
