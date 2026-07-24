import { describe, expect, it } from "vitest";
import { AuthRequestError, getAuthErrorMessage } from "./auth";

describe("getAuthErrorMessage", () => {
  it("keeps actionable validation feedback", () => {
    const error = new AuthRequestError("Request failed with status 400", 400, {
      message: {
        formErrors: ["Password must contain one uppercase letter"],
      },
    });

    expect(getAuthErrorMessage(error, "Service unavailable")).toBe(
      "Password must contain one uppercase letter",
    );
  });

  it("keeps safe client error messages from the authentication service", () => {
    const error = new AuthRequestError("Account already exists", 400);

    expect(getAuthErrorMessage(error, "Service unavailable")).toBe(
      "Account already exists",
    );
  });

  it("replaces internal server wording with an actionable service message", () => {
    const error = new AuthRequestError("Internal server error", 500);

    expect(getAuthErrorMessage(error, "Service unavailable")).toBe(
      "Service unavailable",
    );
  });

  it("uses the service message for network failures", () => {
    expect(
      getAuthErrorMessage(new TypeError("Failed to fetch"), "Service unavailable"),
    ).toBe("Service unavailable");
  });
});
