"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Download,
  FileText,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  formatWalletMoney,
  type WalletTransaction,
  type WalletTransactionStatus,
} from "@/lib/wallet";

const STATUS_STYLES: Record<WalletTransactionStatus, string> = {
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

const transactionLabel = (transaction: WalletTransaction) =>
  transaction.type === "campaign_spend"
    ? "Campaign spend"
    : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);

const downloadCsv = (filename: string, rows: string[][]) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function PaymentHistory({
  transactions,
  query,
  onQueryChange,
}: {
  transactions: WalletTransaction[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const [period, setPeriod] = useState<"all" | "month">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    transactions[0]?.id ?? null,
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const now = new Date();
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      if (
        period === "month" &&
        (transactionDate.getMonth() !== now.getMonth() ||
          transactionDate.getFullYear() !== now.getFullYear())
      ) {
        return false;
      }
      return (
        !normalized ||
        transaction.id.toLowerCase().includes(normalized) ||
        transaction.merchant.toLowerCase().includes(normalized) ||
        transactionLabel(transaction).toLowerCase().includes(normalized)
      );
    });
  }, [period, query, transactions]);

  const selected =
    filtered.find((transaction) => transaction.id === selectedId) ??
    filtered[0] ??
    null;

  const totalSpend = filtered
    .filter(
      (transaction) =>
        transaction.type === "campaign_spend" &&
        transaction.status === "success",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const spendCurrency =
    filtered.find((transaction) => transaction.type === "campaign_spend")
      ?.currency ?? "NGN";

  const exportTransactions = () =>
    downloadCsv("growdex-wallet-transactions.csv", [
      ["Transaction ID", "Date", "Type", "Merchant", "Amount", "Currency", "Status"],
      ...filtered.map((transaction) => [
        transaction.id,
        transaction.date,
        transactionLabel(transaction),
        transaction.merchant,
        String(transaction.amount),
        transaction.currency,
        transaction.status,
      ]),
    ]);

  const exportReceipt = () => {
    if (!selected) return;
    downloadCsv(`growdex-receipt-${selected.id}.csv`, [
      ["Transaction ID", selected.id],
      ["Date", selected.date],
      ["Type", transactionLabel(selected)],
      ["Merchant", selected.merchant],
      ["Amount", String(selected.amount)],
      ["Currency", selected.currency],
      ["Status", selected.status],
    ]);
  };

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="relative md:hidden">
          <span className="sr-only">Search transaction history</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search transactions..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportTransactions}
            disabled={!filtered.length}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-gilroy-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 sm:flex-none"
          >
            <Download className="size-4" /> Export CSV
          </button>
          <Link
            href="/panel/wallet/fund"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-khaki-200 px-4 text-sm font-gilroy-semibold text-gray-900 hover:bg-khaki-300 sm:flex-none"
          >
            <Plus className="size-4" /> Add Transaction
          </Link>
        </div>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-[#cba8ed] bg-[#fbf7ff]">
        <div className="flex h-10 items-center gap-2 bg-[#bd72ef] px-4 text-xs font-gilroy-semibold text-white">
          <TrendingUp className="size-4" /> AI INSIGHTS
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-[#6b4b7c]">
            You spent {formatWalletMoney(totalSpend, spendCurrency)} on successful campaigns in this period.
          </p>
          <div className="shrink-0 sm:text-right">
            <p className="text-[10px] font-gilroy-semibold uppercase tracking-wide text-[#a464c7]">
              Total spend
            </p>
            <p className="mt-1 text-lg font-gilroy-bold text-gray-900">
              {formatWalletMoney(totalSpend, spendCurrency)}
            </p>
          </div>
        </div>
      </section>

      <div className="mb-5 inline-flex max-w-full rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setPeriod("all")}
          aria-pressed={period === "all"}
          className={`min-w-28 rounded-md px-5 py-2 text-sm font-gilroy-semibold transition ${
            period === "all"
              ? "bg-khaki-200 text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          All Time
        </button>
        <button
          type="button"
          onClick={() => setPeriod("month")}
          aria-pressed={period === "month"}
          className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-gilroy-semibold transition ${
            period === "month"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Month <CalendarDays className="size-4" />
        </button>
      </div>

      <h2 className="mb-4 text-lg font-gilroy-semibold text-gray-900">
        Payment History
      </h2>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {filtered.length ? (
            <div className="divide-y divide-gray-100">
              <div className="hidden grid-cols-[1.25fr_.9fr_1fr_1fr_auto] gap-4 bg-dimYellow px-4 py-3 text-xs font-gilroy-semibold text-gray-700 lg:grid">
                <span>Transaction ID</span>
                <span>Date</span>
                <span>Transaction Type</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {filtered.map((transaction) => (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() => setSelectedId(transaction.id)}
                  className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 text-left text-sm transition-colors lg:grid-cols-[1.25fr_.9fr_1fr_1fr_auto] ${
                    selected?.id === transaction.id
                      ? "bg-emerald-50/60 ring-1 ring-inset ring-emerald-300"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                        transaction.type === "deposit"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <ArrowDownLeft className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-gilroy-semibold text-gray-900">
                        {transaction.id}
                      </span>
                      <span className="block truncate text-xs text-gray-400 lg:hidden">
                        {transaction.merchant}
                      </span>
                    </span>
                  </span>
                  <span className="hidden text-gray-500 lg:block">
                    {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
                      new Date(transaction.date),
                    )}
                  </span>
                  <span className="hidden text-gray-700 lg:block">
                    {transactionLabel(transaction)}
                  </span>
                  <span className="hidden font-gilroy-semibold text-gray-900 lg:block">
                    {formatWalletMoney(transaction.amount, transaction.currency)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-gilroy-semibold capitalize ${STATUS_STYLES[transaction.status]}`}
                  >
                    {transaction.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <FileText className="size-10 text-gray-300" />
              <p className="mt-3 font-gilroy-semibold text-gray-900">
                No transactions found
              </p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Change the search or time period to see more wallet activity.
              </p>
            </div>
          )}
        </section>

        <aside className="h-fit overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="bg-[#332f16] px-5 py-3 text-sm font-gilroy-semibold text-khaki-200">
            Details
          </div>
          {selected ? (
            <div className="p-5">
              <div className="rounded-xl bg-mintcream-50 p-4 text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-gilroy-semibold capitalize ${STATUS_STYLES[selected.status]}`}
                >
                  {selected.status}
                </span>
                <p className="mt-3 text-2xl font-gilroy-bold text-gray-950">
                  {formatWalletMoney(selected.amount, selected.currency)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(
                    new Date(selected.date),
                  )}
                </p>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-400">Transaction reference</dt>
                  <dd className="mt-1 break-all font-gilroy-semibold text-gray-900">
                    {selected.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Merchant</dt>
                  <dd className="mt-1 text-gray-900">{selected.merchant}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Transaction type</dt>
                  <dd className="mt-1 text-gray-900">
                    {transactionLabel(selected)}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={exportReceipt}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-gilroy-semibold text-white hover:bg-gray-800"
              >
                <Download className="size-4" /> View receipt
              </button>
            </div>
          ) : (
            <p className="p-5 text-sm text-gray-500">
              Select a transaction to view its details.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
