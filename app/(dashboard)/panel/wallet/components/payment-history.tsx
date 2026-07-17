"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  Search,
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

export default function PaymentHistory({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | WalletTransactionStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    transactions[0]?.id ?? null,
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      if (status !== "all" && transaction.status !== status) return false;
      return (
        !normalized ||
        transaction.id.toLowerCase().includes(normalized) ||
        transaction.merchant.toLowerCase().includes(normalized) ||
        transactionLabel(transaction).toLowerCase().includes(normalized)
      );
    });
  }, [query, status, transactions]);

  const selected =
    filtered.find((transaction) => transaction.id === selectedId) ??
    filtered[0] ??
    null;

  const exportCsv = () => {
    const rows = [
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
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "growdex-wallet-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 2xl:flex-row 2xl:items-center lg:p-5">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transactions, merchants, or categories…"
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
            />
          </div>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | WalletTransactionStatus)
            }
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600"
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!filtered.length}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-gilroy-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Download className="size-4" /> Export CSV
          </button>
        </div>

        {filtered.length ? (
          <div className="divide-y divide-gray-100">
            <div className="hidden grid-cols-[1.3fr_1fr_1fr_1fr_auto] gap-4 bg-dimYellow px-5 py-3 text-xs font-gilroy-semibold text-gray-700 lg:grid">
              <span>Transaction</span>
              <span>Date</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {filtered.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => setSelectedId(transaction.id)}
                className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left text-sm transition-colors lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] ${
                  selected?.id === transaction.id
                    ? "bg-emerald-50/60"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${transaction.type === "deposit" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {transaction.type === "deposit" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
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
                <span className={`rounded-full px-3 py-1 text-xs font-gilroy-semibold capitalize ${STATUS_STYLES[transaction.status]}`}>
                  {transaction.status}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <FileText className="size-10 text-gray-300" />
            <p className="mt-3 font-gilroy-semibold text-gray-900">No transactions found</p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Change the search or status filter to see more wallet activity.
            </p>
          </div>
        )}
      </section>

      <aside className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-[#332f16] px-5 py-4 text-sm font-gilroy-semibold text-khaki-200">
          Transaction details
        </div>
        {selected ? (
          <div className="p-5">
            <div className="rounded-xl bg-mintcream-50 p-4 text-center">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-gilroy-semibold capitalize ${STATUS_STYLES[selected.status]}`}>
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
                <dd className="mt-1 text-gray-900">{transactionLabel(selected)}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="p-5 text-sm text-gray-500">
            Select a transaction to view its details.
          </p>
        )}
      </aside>
    </div>
  );
}
