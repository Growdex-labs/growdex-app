import { describe, expect, it } from "vitest";
import { parseWalletOverview, resolveAdAccountBalance } from "./wallet";

describe("parseWalletOverview", () => {
  beforeEach(() => apiFetch.mockReset());

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

  it("matches balances to the exact connected provider account", () => {
    const overview = parseWalletOverview({
      balances: { NGN: 0, USD: 0 },
      adAccounts: [
        { platform: "meta", accountId: "act_wrong", accountName: "Wrong", balance: 900, currency: "USD", amountSpent: 0, isPrepayAccount: true },
        { platform: "meta", accountId: "act_connected", accountName: "Connected", balance: 50, currency: "USD", amountSpent: 0, isPrepayAccount: true },
      ],
      spending: [], spendChangePercent: 0, transactions: [],
    });
    expect(resolveAdAccountBalance(overview, "meta", "act_connected").account?.balance).toBe(50);
    expect(resolveAdAccountBalance(overview, "meta", "act_missing").state).toBe("unavailable");
  });

  it("does not display stale or unavailable values as current balances", () => {
    const overview = parseWalletOverview({
      balances: { NGN: 0, USD: 0 },
      adAccounts: [{ platform: "tiktok", accountId: "adv_1", accountName: "TikTok", balance: 10, currency: "USD", amountSpent: 0, isPrepayAccount: true, balanceAsOf: "2026-01-01T00:00:00Z" }],
      spending: [], spendChangePercent: 0, transactions: [],
    });
    expect(resolveAdAccountBalance(overview, "tiktok", "adv_1", Date.parse("2026-01-02T00:00:00Z")).state).toBe("stale");
  });
});
