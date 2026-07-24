"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Loader2,
  Plus,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { useMe } from "@/context/me-context";
import {
  fetchWalletOverview,
  formatWalletMoney,
  type WalletCurrency,
  type WalletOverview,
  type WalletTransaction,
} from "@/lib/wallet";
import { WalletHeader } from "./components/wallet-header";
import { WalletSidebar } from "./components/wallet-sidebar";

const STATUS_STYLES = {
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

const transactionLabel = (transaction: WalletTransaction) =>
  transaction.type === "campaign_spend"
    ? "Campaign spend"
    : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);

function SpendingChart({ overview }: { overview: WalletOverview }) {
  if (overview.spending.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
        <h2 className="font-gilroy-semibold text-gray-950">
          Spending insights
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Last six months by ad platform
        </p>
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
          <div>
            <TrendingUp className="mx-auto size-6 text-gray-300" />
            <p className="mt-3 text-sm font-gilroy-semibold text-gray-700">
              No platform spending yet
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
              Spending insights will appear after a campaign starts using your
              funding account.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const max = Math.max(
    1,
    ...overview.spending.flatMap((point) => [point.meta, point.tiktok]),
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-gilroy-semibold text-gray-950">
            Spending insights
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Last six months by ad platform
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-gilroy-semibold text-emerald-700">
          <TrendingUp className="size-3.5" /> {overview.spendChangePercent}%
        </span>
      </div>

      <div className="mt-8 flex h-52 items-end gap-4 border-b border-gray-200 px-2 sm:gap-7">
        {overview.spending.map((point) => (
          <div
            key={point.label}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div className="flex flex-1 items-end justify-center gap-1.5">
              <span
                className="w-3 rounded-t-full bg-khaki-200 sm:w-4"
                style={{ height: `${Math.max(8, (point.meta / max) * 100)}%` }}
                title={`Meta ${formatWalletMoney(point.meta, "NGN")}`}
              />
              <span
                className="w-3 rounded-t-full bg-[#312f25] sm:w-4"
                style={{
                  height: `${Math.max(8, (point.tiktok / max) * 100)}%`,
                }}
                title={`TikTok ${formatWalletMoney(point.tiktok, "NGN")}`}
              />
            </div>
            <span className="py-3 text-center text-[10px] text-gray-400 sm:text-xs">
              {point.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-5 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-khaki-200" /> Meta
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#312f25]" /> TikTok
        </span>
      </div>
    </section>
  );
}

export default function WalletOverviewPage() {
  const { me } = useMe();
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchWalletOverview()
      .then((result) => {
        if (active) setOverview(result);
      })
      .catch((failure) => {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load the funding overview.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const firstName = me?.profile?.firstName ?? "there";
  return (
    <PanelLayout>
      <div className="flex min-h-full bg-[#f5f5f5]">
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <WalletHeader />
          <div className="mx-auto max-w-6xl space-y-5">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-gray-400">Funding</p>
                <h1 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
                  Good morning, {firstName}!
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/panel/wallet/fund"
                  className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
                >
                  <Plus className="size-4" /> Add funding
                </Link>
                <Link
                  href="/panel/wallet/fund?method=card"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-gilroy-semibold text-gray-800 hover:bg-gray-50"
                >
                  <CreditCard className="size-4" /> Add card
                </Link>
              </div>
            </header>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-gilroy-semibold">Funding unavailable</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            ) : !overview ? (
              <div className="flex min-h-96 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <Loader2 className="size-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
                  <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <WalletCards className="size-4" /> Funding balance
                      </div>
                      <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
                        {(["NGN", "USD"] as const).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrency(item)}
                            className={`rounded-md px-3 py-1.5 transition-colors ${
                              currency === item
                                ? "bg-khaki-200 font-gilroy-semibold text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-8 text-3xl font-gilroy-bold tracking-tight text-gray-950 sm:text-4xl">
                      {formatWalletMoney(overview.balances[currency], currency)}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-xs text-emerald-700">
                      <ArrowUpRight className="size-4" /> Funds available for
                      active campaigns
                    </div>
                  </article>

                  <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
                    <p className="text-sm text-gray-500">Ads breakdown</p>
                    {overview.adAccounts.length === 0 ? (
                      <div className="mt-5 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center">
                        <div>
                          <p className="text-sm font-gilroy-semibold text-gray-700">
                            No platform spend yet
                          </p>
                          <p className="mt-1 text-xs leading-5 text-gray-400">
                            Meta and TikTok activity will appear here when your
                            campaigns start spending.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {overview.adAccounts.map((account) => (
                          <div
                            key={account.platform}
                            className="rounded-xl bg-gray-50 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs uppercase tracking-wide text-gray-400">
                                {account.platform}
                              </span>
                              <span
                                className={`size-2.5 rounded-full ${account.platform === "meta" ? "bg-blue-500" : "bg-gray-900"}`}
                              />
                            </div>
                            <p className="mt-4 text-lg font-gilroy-bold text-gray-900">
                              {formatWalletMoney(
                                account.balance,
                                account.currency,
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </section>

                <SpendingChart overview={overview} />

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 lg:px-6">
                    <div>
                      <h2 className="font-gilroy-semibold text-gray-950">
                        Recent transactions
                      </h2>
                      <p className="mt-1 text-xs text-gray-400">
                        Latest funding activity
                      </p>
                    </div>
                    <Link
                      href="/panel/wallet/transactions"
                      className="text-xs font-gilroy-semibold text-peru-200 hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {overview.transactions.length === 0 ? (
                      <div className="px-5 py-10 text-center lg:px-6">
                        <p className="text-sm font-gilroy-semibold text-gray-700">
                          No funding activity yet
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Your deposits and campaign charges will appear here.
                        </p>
                      </div>
                    ) : (
                      overview.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-sm lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:px-6"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${transaction.type === "deposit" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            >
                              {transaction.type === "deposit" ? (
                                <ArrowDownLeft className="size-4" />
                              ) : (
                                <ArrowUpRight className="size-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-gilroy-semibold text-gray-900">
                                {transactionLabel(transaction)}
                              </p>
                              <p className="truncate text-xs text-gray-400">
                                {transaction.merchant}
                              </p>
                            </div>
                          </div>
                          <span className="hidden text-gray-500 lg:block">
                            {new Intl.DateTimeFormat("en-NG", {
                              dateStyle: "medium",
                            }).format(new Date(transaction.date))}
                          </span>
                          <span className="hidden font-gilroy-semibold text-gray-900 lg:block">
                            {formatWalletMoney(
                              transaction.amount,
                              transaction.currency,
                            )}
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
              </>
            )}
          </div>
        </main>
      </div>
    </PanelLayout>
  );
}
