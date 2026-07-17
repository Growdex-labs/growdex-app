import { apiFetch } from "@/lib/auth";

export type WalletCurrency = "NGN" | "USD";
export type WalletPlatform = "meta" | "tiktok";
export type WalletTransactionStatus = "success" | "failed" | "pending";

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
  adAccounts: Array<{
    platform: WalletPlatform;
    balance: number;
    currency: WalletCurrency;
  }>;
  spending: Array<{
    label: string;
    meta: number;
    tiktok: number;
  }>;
  spendChangePercent: number;
  transactions: WalletTransaction[];
}

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Wallet data was not valid JSON.");
  }
};

const isCurrency = (value: unknown): value is WalletCurrency =>
  value === "NGN" || value === "USD";

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

const parseWalletOverview = (value: unknown): WalletOverview => {
  if (!value || typeof value !== "object") {
    throw new Error("Wallet overview returned an invalid response.");
  }

  const source = "data" in value ? (value as { data?: unknown }).data : value;
  if (!source || typeof source !== "object") {
    throw new Error("Wallet overview returned an invalid response.");
  }

  const overview = source as Partial<WalletOverview>;
  const balances = overview.balances;
  if (
    !balances ||
    typeof balances.NGN !== "number" ||
    typeof balances.USD !== "number" ||
    !Array.isArray(overview.adAccounts) ||
    !overview.adAccounts.every(
      (account) =>
        (account.platform === "meta" || account.platform === "tiktok") &&
        typeof account.balance === "number" &&
        isCurrency(account.currency),
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
    throw new Error("Wallet overview returned an invalid response shape.");
  }

  return overview as WalletOverview;
};

export const fetchWalletOverview = async (): Promise<WalletOverview> => {
  const response = await apiFetch("/wallet", { method: "GET" });
  const data = await readJson(response);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `Wallet overview failed (${response.status}).`;
    throw new Error(message);
  }
  return parseWalletOverview(data);
};

export const formatWalletMoney = (
  amount: number,
  currency: WalletCurrency,
) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

