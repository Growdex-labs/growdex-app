/**
 * Growdex bills Nigerian advertisers in naira and everyone else in dollars.
 *
 * This is only the fallback. When an ad account is selected, the platform
 * dictates the currency and campaign publishing rejects anything that does not
 * match it, so the account currency always wins over the value resolved here.
 */

export const DEFAULT_CURRENCY = "USD";

/**
 * Names and ISO codes that reach us from onboarding, where the country is a
 * free-text field rather than a validated ISO 3166 code.
 */
const NIGERIA_ALIASES = new Set([
  "ng",
  "nga",
  "566",
  "nigeria",
  "federal republic of nigeria",
]);

export const isNigeria = (country?: string | null): boolean =>
  typeof country === "string" &&
  NIGERIA_ALIASES.has(country.trim().toLowerCase());

/**
 * Resolves the currency for a country, checking each candidate in order and
 * using the first one that is filled in.
 */
export const currencyForCountry = (
  ...countries: (string | null | undefined)[]
): string => {
  for (const country of countries) {
    if (typeof country !== "string" || !country.trim()) continue;
    return isNigeria(country) ? "NGN" : "USD";
  }
  return DEFAULT_CURRENCY;
};

export const isCurrencyCode = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Z]{3}$/.test(value);

const localeForCurrency = (currency: string) =>
  currency === "NGN" ? "en-NG" : "en-US";

/**
 * The short symbol for a currency, such as ₦ or $. Falls back to the ISO code
 * when the runtime has no symbol for it.
 */
export const currencySymbol = (currency: string): string => {
  try {
    return (
      new Intl.NumberFormat(localeForCurrency(currency), {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? currency
    );
  } catch {
    return currency;
  }
};

/**
 * An amount of money that only means something alongside its currency. Ad
 * accounts each bill in one currency and Growdex never converts between them,
 * so totals arrive as one entry per currency instead of a single number.
 */
export type MoneyTotal = { currency: string; amount: number };

/**
 * Joins per-currency totals for display. One currency reads as a plain amount.
 * Several read as a sum that is deliberately left unadded.
 */
export const formatMoneyTotals = (
  totals: MoneyTotal[],
  fallbackCurrency: string = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions,
): string => {
  if (totals.length === 0) return formatMoney(0, fallbackCurrency, options);
  return totals
    .map(({ amount, currency }) => formatMoney(amount, currency, options))
    .join(" + ");
};

/** Formats an amount in its own currency, such as ₦5,000.00 or $12.50. */
export const formatMoney = (
  amount: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string => {
  try {
    return new Intl.NumberFormat(localeForCurrency(currency), {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      ...options,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};
