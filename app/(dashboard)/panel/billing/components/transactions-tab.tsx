"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Search,
} from "lucide-react";
import {
  formatWalletMoney,
  type WalletOverview,
  type WalletTransaction,
} from "@/lib/wallet";

type TransactionFilter = "all" | "meta" | "tiktok" | "funding" | "refunds";

const FILTERS: Array<{ id: TransactionFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "meta", label: "Meta" },
  { id: "tiktok", label: "TikTok" },
  { id: "funding", label: "Funding" },
  { id: "refunds", label: "Refunds" },
];

const STATUS_STYLES = {
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

const TRANSACTION_LABELS: Record<WalletTransaction["type"], string> = {
  deposit: "Funding",
  campaign_spend: "Campaign spend",
  refund: "Refund",
  withdrawal: "Withdrawal",
};

const formatTransactionDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(date);
};

const matchesFilter = (
  transaction: WalletTransaction,
  filter: TransactionFilter,
) => {
  const merchant = transaction.merchant.toLowerCase();
  if (filter === "all") return true;
  if (filter === "meta") return merchant.includes("meta");
  if (filter === "tiktok") return merchant.includes("tiktok");
  if (filter === "funding") return transaction.type === "deposit";
  return transaction.type === "refund";
};

interface TransactionsTabProps {
  overview: WalletOverview | null;
  error: string | null;
  initialFilter?: TransactionFilter;
  onRetry: () => void;
}

export function TransactionsTab({
  overview,
  error,
  initialFilter = "all",
  onRetry,
}: TransactionsTabProps) {
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (overview?.transactions ?? []).filter(
      (transaction) =>
        matchesFilter(transaction, filter) &&
        (!search ||
          transaction.merchant.toLowerCase().includes(search) ||
          TRANSACTION_LABELS[transaction.type].toLowerCase().includes(search)),
    );
  }, [overview, filter, query]);

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Transactions unavailable</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-xs font-gilroy-semibold underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                filter === item.id
                  ? "bg-khaki-200 font-gilroy-semibold text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="relative min-w-0 lg:w-72">
          <span className="sr-only">Search transactions</span>
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions or merchants..."
            className="h-10 w-full rounded-lg border border-gray-100 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-khaki-300"
          />
        </label>
      </div>

      <div className="divide-y divide-gray-100">
        {visible.length === 0 ? (
          <div className="px-5 py-12 text-center lg:px-6">
            <p className="text-sm font-gilroy-semibold text-gray-700">
              No transactions to show
            </p>
            <p className="mt-1 text-xs text-dimGray">
              Funding, campaign spend, and refunds appear here.
            </p>
          </div>
        ) : (
          visible.map((transaction) => (
            <div
              key={transaction.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-sm lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    transaction.type === "deposit" ||
                    transaction.type === "refund"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {transaction.type === "deposit" ||
                  transaction.type === "refund" ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-gilroy-semibold text-gray-900">
                    {TRANSACTION_LABELS[transaction.type]}
                  </p>
                  <p className="truncate text-xs text-dimGray">
                    {transaction.merchant}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 lg:hidden">
                    {formatTransactionDate(transaction.date)} ·{" "}
                    {formatWalletMoney(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>
              <span className="hidden text-gray-500 lg:block">
                {formatTransactionDate(transaction.date)}
              </span>
              <span className="hidden font-gilroy-semibold text-gray-900 lg:block">
                {formatWalletMoney(transaction.amount, transaction.currency)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-gilroy-semibold capitalize ${STATUS_STYLES[transaction.status]}`}
              >
                {transaction.status}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export type { TransactionFilter };
