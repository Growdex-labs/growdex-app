import { describe, expect, it } from "vitest";
import { PASSWORD_RULES, passwordMeetsRules } from "./password-rules";

describe("passwordMeetsRules", () => {
  it("accepts a password that meets every rule", () => {
    expect(passwordMeetsRules("Growdex1!")).toBe(true);
  });

  it("rejects a password that is only letters", () => {
    expect(passwordMeetsRules("password")).toBe(false);
  });
});

describe("PASSWORD_RULES", () => {
  it("marks each missing piece on a short letter-only password", () => {
    const value = "abc";
    expect(
      PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.id),
    ).toEqual(["length", "upper", "number", "symbol"]);
  });
});
