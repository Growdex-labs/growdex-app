import {
  currencyForOnboardingCountry,
  type OnboardingBudgetCurrency,
} from '@/lib/onboarding-country';

export const INDUSTRY_OPTIONS = [
  { label: "Advertising & Marketing", value: "Advertising & Marketing" },
  { label: "Agriculture", value: "Agriculture" },
  { label: "Automotive", value: "Automotive" },
  { label: "Construction", value: "Construction" },
  { label: "Education", value: "Education" },
  { label: "Energy & Utilities", value: "Energy & Utilities" },
  { label: "Financial Services", value: "Financial Services" },
  { label: "Food & Beverage", value: "Food & Beverage" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Hospitality & Travel", value: "Hospitality & Travel" },
  { label: "Legal Services", value: "Legal Services" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Media & Entertainment", value: "Media & Entertainment" },
  { label: "Nonprofit", value: "Nonprofit" },
  { label: "Professional Services", value: "Professional Services" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Retail & E-commerce", value: "Retail & E-commerce" },
  { label: "Software & Technology", value: "Software & Technology" },
  { label: "Telecommunications", value: "Telecommunications" },
  { label: "Transportation & Logistics", value: "Transportation & Logistics" },
  { label: "Other", value: "Other" },
];

export const COMPANY_SIZE_OPTIONS = [
  { label: "Just me", value: "1" },
  { label: "2 - 10 people", value: "10" },
  { label: "11 - 25 people", value: "25" },
  { label: "26 - 50 people", value: "50" },
  { label: "51 - 200 people", value: "200" },
  { label: "201 - 500 people", value: "500" },
  { label: "500+ people", value: "1000" },
];

const USD_MONTHLY_BUDGET_OPTIONS = [
  { label: "$0 - $499 / month", value: "0-500" },
  { label: "$500 - $999 / month", value: "500-1000" },
  { label: "$1,000 - $4,999 / month", value: "1000-5000" },
  { label: "$5,000 - $9,999 / month", value: "5000-10000" },
  { label: "$10,000+ / month", value: "10000+" },
];

const NGN_MONTHLY_BUDGET_OPTIONS = [
  { label: "₦0 - ₦99,999 / month", value: "0-100000" },
  { label: "₦100,000 - ₦499,999 / month", value: "100000-500000" },
  { label: "₦500,000 - ₦999,999 / month", value: "500000-1000000" },
  { label: "₦1,000,000 - ₦4,999,999 / month", value: "1000000-5000000" },
  { label: "₦5,000,000+ / month", value: "5000000+" },
];

const MONTHLY_BUDGET_OPTIONS_BY_CURRENCY: Record<
  OnboardingBudgetCurrency,
  { label: string; value: string }[]
> = {
  USD: USD_MONTHLY_BUDGET_OPTIONS,
  NGN: NGN_MONTHLY_BUDGET_OPTIONS,
};

export const monthlyBudgetOptionsForCountry = (country?: string | null) =>
  MONTHLY_BUDGET_OPTIONS_BY_CURRENCY[
    currencyForOnboardingCountry(country)
  ];
