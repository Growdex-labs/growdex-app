import { apiFetch } from "./auth";

export type WalletCurrency = string;
export type WalletPlatform = "meta" | "tiktok";
export type WalletTransactionStatus = "success" | "failed" | "pending";
export type AdBalanceStatus = "available" | "unavailable" | "error";

export interface WalletTransaction {
  id: string;
  date: string;
  type: "deposit" | "campaign_spend" | "refund" | "withdrawal";
  amount: number;
  currency: WalletCurrency;
  status: WalletTransactionStatus;
  merchant: string;
}

export interface WalletOverview {
  balances: Record<WalletCurrency, number>;
  adAccounts: WalletAdAccountBalance[];
  spending: Array<{
    label: string;
    meta: number;
    tiktok: number;
  }>;
  spendChangePercent: number;
  transactions: WalletTransaction[];
}

export interface WalletAdAccountBalance {
    platform: WalletPlatform;
    accountId: string;
    accountName: string;
    /** Null means the platform did not provide a balance; it is not zero. */
    balance: number | null;
    currency: WalletCurrency;
    amountSpent: number | null;
    isPrepayAccount: boolean | null;
    balanceStatus?: AdBalanceStatus;
    balanceAsOf?: string | null;
    balanceError?: string | null;
}

export const fetchAdAccountBalances = async (): Promise<WalletAdAccountBalance[]> => {
  const response = await apiFetch("/users/ad-accounts/billing", { method: "GET" });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Advertising balances failed (${response.status}).`);
  const rows = Array.isArray(body)
    ? body
    : body && typeof body === "object" && "data" in body && Array.isArray((body as { data: unknown }).data)
      ? (body as { data: unknown[] }).data
      : null;
  if (!rows) throw new Error("Advertising balances returned an invalid response.");
  return rows.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const row = value as Record<string, unknown>;
    if ((row.platform !== "meta" && row.platform !== "tiktok") ||
      typeof row.accountId !== "string" || typeof row.accountName !== "string" ||
      !isCurrency(row.currency)) return [];
    return [{
      platform: row.platform,
      accountId: row.accountId,
      accountName: row.accountName,
      balance: typeof row.balance === "number" ? row.balance : null,
      currency: row.currency,
      amountSpent: typeof row.amountSpent === "number" ? row.amountSpent : null,
      isPrepayAccount: typeof row.isPrepayAccount === "boolean" ? row.isPrepayAccount : null,
      balanceStatus: row.balanceStatus === "error" || row.balanceStatus === "unavailable"
        ? row.balanceStatus
        : typeof row.balance === "number" ? "available" : "unavailable",
      balanceAsOf: typeof row.balanceAsOf === "string" ? row.balanceAsOf : null,
      balanceError: typeof row.balanceError === "string" ? row.balanceError : null,
    } satisfies WalletAdAccountBalance];
  });
};

export interface ResolvedAdBalance {
  account: WalletAdAccountBalance | null;
  state: "available" | "unavailable" | "error" | "stale";
}

const BALANCE_STALE_AFTER_MS = 6 * 60 * 60 * 1000;

/** Match by provider account ID, never merely by platform or list position. */
export const resolveAdAccountBalance = (
  overview: Pick<WalletOverview, "adAccounts">,
  platform: WalletPlatform,
  providerAccountId: string,
  now = Date.now(),
): ResolvedAdBalance => {
  const account = overview.adAccounts.find(
    (candidate) =>
      candidate.platform === platform && candidate.accountId === providerAccountId,
  ) ?? null;
  if (!account) return { account: null, state: "unavailable" };
  if (account.balanceStatus === "error") return { account, state: "error" };
  if (account.balanceStatus === "unavailable" || account.balance === null) {
    return { account, state: "unavailable" };
  }
  if (account.balanceAsOf) {
    const timestamp = new Date(account.balanceAsOf).getTime();
    if (!Number.isFinite(timestamp) || now - timestamp > BALANCE_STALE_AFTER_MS) {
      return { account, state: "stale" };
    }
  }
  return { account, state: "available" };
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Funding data was not valid JSON.");
  }
};

const isCurrency = (value: unknown): value is WalletCurrency =>
  typeof value === "string" && /^[A-Z]{3}$/.test(value);

const isTransaction = (value: unknown): value is WalletTransaction => {
  if (!value || typeof value !== "object") return false;
  const transaction = value as Partial<WalletTransaction>;
  return (
    typeof transaction.id === "string" &&
    typeof transaction.date === "string" &&
    ["deposit", "campaign_spend", "refund", "withdrawal"].includes(
      transaction.type ?? "",
    ) &&
    typeof transaction.amount === "number" &&
    isCurrency(transaction.currency) &&
    ["success", "failed", "pending"].includes(transaction.status ?? "") &&
    typeof transaction.merchant === "string"
  );
};

export const parseWalletOverview = (value: unknown): WalletOverview => {
  if (!value || typeof value !== "object") {
    throw new Error("Funding overview returned an invalid response.");
  }

  const source = "data" in value ? (value as { data?: unknown }).data : value;
  if (!source || typeof source !== "object") {
    throw new Error("Funding overview returned an invalid response.");
  }

  const overview = source as Partial<WalletOverview>;
  const balances = overview.balances;
  if (
    !balances ||
    !("NGN" in balances) ||
    !("USD" in balances) ||
    !Object.values(balances).every((balance) => typeof balance === "number") ||
    !Array.isArray(overview.adAccounts) ||
    !overview.adAccounts.every(
      (account) =>
        (account.platform === "meta" || account.platform === "tiktok") &&
        typeof account.accountId === "string" &&
        typeof account.accountName === "string" &&
        (typeof account.balance === "number" || account.balance === null) &&
        isCurrency(account.currency) &&
        (typeof account.amountSpent === "number" || account.amountSpent === null) &&
        (typeof account.isPrepayAccount === "boolean" || account.isPrepayAccount === null) &&
        (account.balanceStatus === undefined || ["available", "unavailable", "error"].includes(account.balanceStatus)) &&
        (account.balanceAsOf === undefined || account.balanceAsOf === null || typeof account.balanceAsOf === "string") &&
        (account.balanceError === undefined || account.balanceError === null || typeof account.balanceError === "string"),
    ) ||
    !Array.isArray(overview.spending) ||
    !overview.spending.every(
      (point) =>
        typeof point.label === "string" &&
        typeof point.meta === "number" &&
        typeof point.tiktok === "number",
    ) ||
    typeof overview.spendChangePercent !== "number" ||
    !Array.isArray(overview.transactions) ||
    !overview.transactions.every(isTransaction)
  ) {
    throw new Error("Funding overview returned an invalid response shape.");
  }

  return overview as WalletOverview;
};

export const fetchWalletOverview = async (): Promise<WalletOverview> => {
  // This is a browser-to-API request. Avoid non-safelisted cache headers here:
  // they trigger a CORS preflight on cross-origin deployments and can turn a
  // valid wallet request into the browser's generic "Failed to fetch" error.
  // Freshness is determined from the provider's balanceAsOf value below.
  const response = await apiFetch("/wallet", { method: "GET" });
  const data = await readJson(response);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `Funding overview failed (${response.status}).`;
    throw new Error(message);
  }
  return parseWalletOverview(data);
};

export const formatWalletMoney = (amount: number, currency: WalletCurrency) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
