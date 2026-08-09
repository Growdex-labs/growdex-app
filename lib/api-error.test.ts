import { describe, expect, it } from "vitest";
import { readApiErrorMessage } from "@/lib/api-error";

describe("readApiErrorMessage", () => {
  it("explains which field failed validation", () => {
    const message = readApiErrorMessage(
      {
        message: "Validation failed",
        errors: [
          { field: "audienceStrategies.0.budget.amount", message: "Too small" },
        ],
      },
      "Request failed.",
    );

    expect(message).toBe("audienceStrategies.0.budget.amount: Too small");
  });

  it("reads a field error reported as a path", () => {
    const message = readApiErrorMessage(
      { errors: [{ path: ["campaign", "name"], message: "Required" }] },
      "Request failed.",
    );

    expect(message).toBe("campaign.name: Required");
  });

  it("joins a list of messages", () => {
    const message = readApiErrorMessage(
      { message: ["email must be an email", "password is too short"] },
      "Request failed.",
    );

    expect(message).toBe("email must be an email, password is too short");
  });

  it("keeps a plain message", () => {
    expect(readApiErrorMessage({ message: "Wallet is empty" }, "Fallback")).toBe(
      "Wallet is empty",
    );
  });

  it("falls back when the body carries nothing useful", () => {
    expect(readApiErrorMessage(null, "Fallback")).toBe("Fallback");
    expect(readApiErrorMessage({ errors: [] }, "Fallback")).toBe("Fallback");
  });
});
