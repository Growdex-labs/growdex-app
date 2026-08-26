import { describe, expect, it } from "vitest";
import {
  formatUsage,
  parseInvoices,
  parsePaymentMethods,
  parseSubscription,
  usagePercent,
} from "./billing";

const unpaidSubscription = {
  plan: "free",
  status: "active",
  priceMonthly: 0,
  currency: "USD",
  renewsAt: null,
  usage: {
    activeCampaigns: { used: 0, limit: 0 },
    aiChat: { used: 0, limit: 0 },
    aiCampaignGenerations: { used: 0, limit: 0 },
    aiCopyGenerations: { used: 0, limit: 0 },
  },
};

describe("parseSubscription", () => {
  it("accepts an unpaid account with no renewal date", () => {
    expect(parseSubscription(unpaidSubscription)).toEqual(unpaidSubscription);
  });

  it("accepts a pro account whose limits are unlimited", () => {
    const pro = {
      ...unpaidSubscription,
      plan: "pro",
      priceMonthly: 49,
      renewsAt: "2026-09-09T00:00:00.000Z",
      usage: {
        activeCampaigns: { used: 18, limit: null },
        aiChat: { used: 120, limit: null },
        aiCampaignGenerations: { used: 44, limit: null },
        aiCopyGenerations: { used: 300, limit: null },
      },
    };

    expect(parseSubscription(pro)).toEqual(pro);
  });

  it("rejects a plan the app does not sell", () => {
    expect(() =>
      parseSubscription({ ...unpaidSubscription, plan: "enterprise" }),
    ).toThrow(/invalid response shape/);
  });

  it("rejects usage counters that are missing a feature", () => {
    expect(() =>
      parseSubscription({
        ...unpaidSubscription,
        usage: { activeCampaigns: { used: 0, limit: 3 } },
      }),
    ).toThrow(/invalid response shape/);
  });
});

describe("parsePaymentMethods", () => {
  it("accepts an account with no saved methods", () => {
    expect(parsePaymentMethods([])).toEqual([]);
  });

  it("rejects a method that carries no expiry", () => {
    expect(() =>
      parsePaymentMethods([
        {
          id: "pm-1",
          brand: "Mastercard",
          last4: "7223",
          isDefault: true,
          usedFor: "both",
        },
      ]),
    ).toThrow(/invalid response shape/);
  });
});

describe("parseInvoices", () => {
  it("accepts a paid subscription invoice without a PDF", () => {
    const invoices = [
      {
        id: "inv-1",
        number: "GDX-2026-0001",
        date: "2026-06-01T09:00:00.000Z",
        description: "Growdex Pro subscription",
        amount: 49,
        currency: "USD",
        status: "paid",
      },
    ];

    expect(parseInvoices(invoices)).toEqual(invoices);
  });

  it("rejects an invoice status the app cannot display", () => {
    expect(() =>
      parseInvoices([
        {
          id: "inv-1",
          number: "GDX-2026-0001",
          date: "2026-06-01T09:00:00.000Z",
          description: "Growdex Pro subscription",
          amount: 49,
          currency: "USD",
          status: "disputed",
        },
      ]),
    ).toThrow(/invalid response shape/);
  });
});

describe("formatUsage", () => {
  it("shows the limit on a metered plan", () => {
    expect(formatUsage({ used: 2, limit: 3 })).toBe("2 / 3");
  });

  it("shows unlimited when the plan has no cap", () => {
    expect(formatUsage({ used: 120, limit: null })).toBe("120 / Unlimited");
  });
});

describe("usagePercent", () => {
  it("caps the bar at full when usage passes the limit", () => {
    expect(usagePercent({ used: 5, limit: 3 })).toBe(100);
  });

  it("reports zero for an unlimited plan", () => {
    expect(usagePercent({ used: 120, limit: null })).toBe(0);
  });
});
