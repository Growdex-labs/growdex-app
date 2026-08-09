import { apiFetch } from "./auth";

export type BillingPlanId = "free" | "pro";

export interface PlanLimit {
  used: number;
  limit: number | null;
}

export interface SubscriptionUsage {
  activeCampaigns: PlanLimit;
  aiChat: PlanLimit;
  aiCampaignGenerations: PlanLimit;
  aiCopyGenerations: PlanLimit;
}

export type SubscriptionStatus = "active" | "past_due" | "canceled";

export interface Subscription {
  plan: BillingPlanId;
  status: SubscriptionStatus;
  priceMonthly: number;
  currency: string;
  renewsAt: string | null;
  usage: SubscriptionUsage;
}

export type PaymentMethodUse = "subscription" | "funding" | "both";

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  usedFor: PaymentMethodUse;
}

export type InvoiceStatus = "paid" | "open" | "refunded";

export interface Invoice {
  id: string;
  number: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  pdfUrl?: string;
}

export const PRO_PLAN_PRICE = 49;

export const PRO_PLAN_FEATURES = [
  "Unlimited active campaigns",
  "Unlimited AI Chat",
  "Unlimited AI Campaign Generation",
  "Unlimited AI Copy Generation",
  "AI audience recommendations",
  "AI creative variations",
  "AI optimization suggestions",
  "Advanced analytics",
  "Performance insights",
  "Priority email support",
  "Early access to new features",
];

export const FREE_PLAN_USAGE: SubscriptionUsage = {
  activeCampaigns: { used: 0, limit: 3 },
  aiChat: { used: 0, limit: 10 },
  aiCampaignGenerations: { used: 0, limit: 5 },
  aiCopyGenerations: { used: 0, limit: 10 },
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Billing data was not valid JSON.");
  }
};

const unwrap = (value: unknown): unknown =>
  value && typeof value === "object" && "data" in value
    ? (value as { data?: unknown }).data
    : value;

const request = async (path: string, failureLabel: string) => {
  const response = await apiFetch(path, { method: "GET" });
  const body = await readJson(response);
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `${failureLabel} (${response.status}).`;
    throw new Error(message);
  }
  return unwrap(body);
};

const isPlanLimit = (value: unknown): value is PlanLimit => {
  if (!value || typeof value !== "object") return false;
  const limit = value as Partial<PlanLimit>;
  return (
    typeof limit.used === "number" &&
    (limit.limit === null || typeof limit.limit === "number")
  );
};

export const parseSubscription = (value: unknown): Subscription => {
  if (!value || typeof value !== "object") {
    throw new Error("Subscription returned an invalid response.");
  }

  const subscription = value as Partial<Subscription>;
  const usage = subscription.usage;
  if (
    (subscription.plan !== "free" && subscription.plan !== "pro") ||
    !["active", "past_due", "canceled"].includes(subscription.status ?? "") ||
    typeof subscription.priceMonthly !== "number" ||
    typeof subscription.currency !== "string" ||
    (subscription.renewsAt !== null &&
      typeof subscription.renewsAt !== "string") ||
    !usage ||
    typeof usage !== "object" ||
    !isPlanLimit(usage.activeCampaigns) ||
    !isPlanLimit(usage.aiChat) ||
    !isPlanLimit(usage.aiCampaignGenerations) ||
    !isPlanLimit(usage.aiCopyGenerations)
  ) {
    throw new Error("Subscription returned an invalid response shape.");
  }

  return subscription as Subscription;
};

export const parsePaymentMethods = (value: unknown): PaymentMethod[] => {
  if (!Array.isArray(value)) {
    throw new Error("Payment methods returned an invalid response.");
  }

  if (
    !value.every((item) => {
      if (!item || typeof item !== "object") return false;
      const method = item as Partial<PaymentMethod>;
      return (
        typeof method.id === "string" &&
        typeof method.brand === "string" &&
        typeof method.last4 === "string" &&
        typeof method.expiryMonth === "number" &&
        typeof method.expiryYear === "number" &&
        typeof method.isDefault === "boolean" &&
        ["subscription", "funding", "both"].includes(method.usedFor ?? "")
      );
    })
  ) {
    throw new Error("Payment methods returned an invalid response shape.");
  }

  return value as PaymentMethod[];
};

export const parseInvoices = (value: unknown): Invoice[] => {
  if (!Array.isArray(value)) {
    throw new Error("Invoices returned an invalid response.");
  }

  if (
    !value.every((item) => {
      if (!item || typeof item !== "object") return false;
      const invoice = item as Partial<Invoice>;
      return (
        typeof invoice.id === "string" &&
        typeof invoice.number === "string" &&
        typeof invoice.date === "string" &&
        typeof invoice.description === "string" &&
        typeof invoice.amount === "number" &&
        typeof invoice.currency === "string" &&
        ["paid", "open", "refunded"].includes(invoice.status ?? "") &&
        (invoice.pdfUrl === undefined || typeof invoice.pdfUrl === "string")
      );
    })
  ) {
    throw new Error("Invoices returned an invalid response shape.");
  }

  return value as Invoice[];
};

export const fetchSubscription = async (): Promise<Subscription> =>
  parseSubscription(
    await request("/billing/subscription", "Subscription request failed"),
  );

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> =>
  parsePaymentMethods(
    await request("/billing/payment-methods", "Payment methods request failed"),
  );

export const fetchInvoices = async (): Promise<Invoice[]> =>
  parseInvoices(await request("/billing/invoices", "Invoices request failed"));

const readHostedUrl = async (
  path: string,
  field: "checkoutUrl" | "setupUrl",
  failureLabel: string,
): Promise<string> => {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const body = unwrap(await readJson(response));

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `${failureLabel} (${response.status}).`;
    throw new Error(message);
  }

  const url =
    body && typeof body === "object" && field in body
      ? (body as Record<string, unknown>)[field]
      : null;

  if (typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error(`${failureLabel}: the payment link was not valid.`);
  }

  return url;
};

export const startProCheckout = (): Promise<string> =>
  readHostedUrl(
    "/billing/subscription/checkout",
    "checkoutUrl",
    "Checkout could not start",
  );

export const startPaymentMethodSetup = (): Promise<string> =>
  readHostedUrl(
    "/billing/payment-methods/setup",
    "setupUrl",
    "The payment method page could not open",
  );

const mutatePaymentMethod = async (
  path: string,
  method: "POST" | "DELETE",
  failureLabel: string,
): Promise<PaymentMethod[]> => {
  const response = await apiFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(method === "POST" ? { body: JSON.stringify({}) } : {}),
  });
  const body = await readJson(response);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `${failureLabel} (${response.status}).`;
    throw new Error(message);
  }

  return parsePaymentMethods(unwrap(body));
};

export const setDefaultPaymentMethod = (id: string): Promise<PaymentMethod[]> =>
  mutatePaymentMethod(
    `/billing/payment-methods/${encodeURIComponent(id)}/default`,
    "POST",
    "The default payment method could not be changed",
  );

export const removePaymentMethod = (id: string): Promise<PaymentMethod[]> =>
  mutatePaymentMethod(
    `/billing/payment-methods/${encodeURIComponent(id)}`,
    "DELETE",
    "The payment method could not be removed",
  );

export const formatPlanPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatUsage = ({ used, limit }: PlanLimit) =>
  limit === null ? `${used} / Unlimited` : `${used} / ${limit}`;

export const usagePercent = ({ used, limit }: PlanLimit) =>
  limit === null || limit === 0
    ? 0
    : Math.min(100, Math.round((used / limit) * 100));

export const formatInvoiceDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(date);
};
