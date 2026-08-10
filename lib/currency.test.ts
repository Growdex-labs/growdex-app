import { describe, expect, it } from "vitest";
import {
  currencyForCountry,
  currencySymbol,
  formatMoney,
  formatMoneyTotals,
  isCurrencyCode,
  isNigeria,
} from "./currency";

describe("isNigeria", () => {
  it.each(["NG", "ng", "NGA", "Nigeria", " nigeria ", "566"])(
    "accepts %s",
    (country) => {
      expect(isNigeria(country)).toBe(true);
    },
  );

  it.each(["GH", "Ghana", "Niger", "", null, undefined])(
    "rejects %s",
    (country) => {
      expect(isNigeria(country)).toBe(false);
    },
  );
});

describe("currencyForCountry", () => {
  it("gives naira for Nigeria", () => {
    expect(currencyForCountry("Nigeria")).toBe("NGN");
  });

  it("gives dollars for every other country", () => {
    expect(currencyForCountry("Ghana")).toBe("USD");
  });

  it("gives dollars when no country is known", () => {
    expect(currencyForCountry(null, undefined, "  ")).toBe("USD");
  });

  it("uses the first country that is filled in", () => {
    expect(currencyForCountry(null, "Nigeria", "Ghana")).toBe("NGN");
    expect(currencyForCountry("  ", "Ghana", "Nigeria")).toBe("USD");
  });
});

describe("isCurrencyCode", () => {
  it("accepts an uppercase ISO 4217 code", () => {
    expect(isCurrencyCode("NGN")).toBe(true);
  });

  it.each(["ngn", "NGNN", "N", 12, null])("rejects %s", (value) => {
    expect(isCurrencyCode(value)).toBe(false);
  });
});

describe("currencySymbol", () => {
  it("gives the naira symbol", () => {
    expect(currencySymbol("NGN")).toBe("₦");
  });

  it("gives the dollar symbol", () => {
    expect(currencySymbol("USD")).toBe("$");
  });

  it("gives the code back when the currency is unknown", () => {
    expect(currencySymbol("ZZZ")).toBe("ZZZ");
  });
});

describe("formatMoney", () => {
  it("formats naira", () => {
    expect(formatMoney(5000, "NGN")).toBe("₦5,000.00");
  });

  it("formats dollars", () => {
    expect(formatMoney(12.5, "USD")).toBe("$12.50");
  });

  it("stays readable when the currency is unknown", () => {
    expect(formatMoney(1200, "ZZZ")).toMatch(/^ZZZ\s1,200\.00$/);
  });
});

describe("formatMoneyTotals", () => {
  it("reads as a plain amount when there is one currency", () => {
    expect(formatMoneyTotals([{ currency: "NGN", amount: 5000 }])).toBe(
      "₦5,000.00",
    );
  });

  it("keeps currencies apart instead of adding them", () => {
    expect(
      formatMoneyTotals([
        { currency: "NGN", amount: 5000 },
        { currency: "USD", amount: 40 },
      ]),
    ).toBe("₦5,000.00 + $40.00");
  });

  it("shows zero in the fallback currency when there is no spend", () => {
    expect(formatMoneyTotals([], "NGN")).toBe("₦0.00");
    expect(formatMoneyTotals([])).toBe("$0.00");
  });
});
