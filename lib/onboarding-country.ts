import {
  metaSpecialAdLocations,
  type MetaSpecialAdLocationCode,
} from './meta-special-ad-locations';

export const USD = 'USD';
export const NGN = 'NGN';

export type OnboardingBudgetCurrency = typeof USD | typeof NGN;

const NIGERIA_ALIASES = new Set([
  'ng',
  'nga',
  '566',
  'nigeria',
  'federal republic of nigeria',
]);

/**
 * Matches the server-side fallback used before an ad account supplies its
 * billing currency. The connected ad account remains authoritative later.
 */
export const currencyForOnboardingCountry = (
  country?: string | null,
): OnboardingBudgetCurrency => {
  if (
    typeof country === 'string' &&
    NIGERIA_ALIASES.has(country.trim().toLowerCase())
  ) {
    return NGN;
  }

  return USD;
};

/** Converts a trusted two-letter country code from the hosting provider to its display name. */
export const countryNameForCode = (value?: string | null): string | null => {
  const countryCode = value?.trim().toUpperCase();
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return null;

  return (
    metaSpecialAdLocations[countryCode as MetaSpecialAdLocationCode] ?? null
  );
};
