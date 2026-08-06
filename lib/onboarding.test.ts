import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./auth";
import { saveBusinessInfo, savePersonalInfo } from "./onboarding";

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
    });

    expect(apiFetch).toHaveBeenCalledOnce();
    expect(sentBody()).toMatchObject({ organizationSize: "200" });
  });

  it("omits organization size when it is left unanswered", async () => {
    await savePersonalInfo({
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Analytical Engines",
    });

    expect(apiFetch).toHaveBeenCalledOnce();
    expect(sentBody()).not.toHaveProperty("organizationSize");
  });
});

describe("saveBusinessInfo", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("adds HTTPS to an ordinary website address", async () => {
    await saveBusinessInfo({
      businessName: "Growdex",
      website: "www.growdex.ai",
      advertisingBudget: "500-1000",
      industry: "Software & Technology",
      country: "Nigeria",
    });

    expect(sentBody()).toMatchObject({ website: "https://www.growdex.ai/" });
  });

  it("shows field details before a generic validation message", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Validation failed",
          errors: [{ field: "website", message: "must be a valid URL" }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      saveBusinessInfo({ website: "https://example.com" }),
    ).resolves.toEqual({
      success: false,
      error: "website: must be a valid URL",
    });
  });
});
