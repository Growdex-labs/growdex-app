import { describe, expect, it } from "vitest";
import { parseWalletOverview } from "./wallet";

describe("parseWalletOverview", () => {
  it("accepts a new wallet without platform activity", () => {
    expect(
      parseWalletOverview({
        balances: { NGN: 0, USD: 0 },
        adAccounts: [],
        spending: [],
        spendChangePercent: 0,
        transactions: [],
      }),
    ).toEqual({
      balances: { NGN: 0, USD: 0 },
      adAccounts: [],
      spending: [],
      spendChangePercent: 0,
      transactions: [],
    });
  });

  it("rejects incomplete wallet data", () => {
    expect(() =>
      parseWalletOverview({
        balances: { NGN: 0 },
        adAccounts: [],
        spending: [],
        spendChangePercent: 0,
        transactions: [],
      }),
    ).toThrow("invalid response shape");
  });
});
