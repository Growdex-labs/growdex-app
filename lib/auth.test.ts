import { describe, expect, it } from "vitest";
import {
  AuthRequestError,
  getAuthErrorMessage,
  isEmailNotVerifiedError,
  verificationEmailWasSent,
} from "./auth";

describe("isEmailNotVerifiedError", () => {
  it("recognizes the backend status inside error details", () => {
    expect(
      isEmailNotVerifiedError(
        new AuthRequestError("Unauthorized", 401, {
          status: "EMAIL_NOT_VERIFIED",
        }),
      ),
    ).toBe(true);
  });

  it("recognizes the production verification message", () => {
    expect(
      isEmailNotVerifiedError(
        new AuthRequestError("Please verify your email before signing in", 401),
      ),
    ).toBe(true);
  });

  it("does not treat other login failures as verification errors", () => {
    expect(
      isEmailNotVerifiedError(
        new AuthRequestError("Invalid email or password", 401),
      ),
    ).toBe(false);
  });
});

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

describe("verificationEmailWasSent", () => {
  it("accepts a confirmed delivery", () => {
    expect(verificationEmailWasSent(true)).toBe(true);
  });

  it.each([
    ["an explicit delivery failure", false],
    ["a missing confirmation", undefined],
    ["a null confirmation", null],
    ["a truthy non-boolean value", "true"],
  ])("rejects %s", (_description, value) => {
    expect(verificationEmailWasSent(value)).toBe(false);
  });
});
