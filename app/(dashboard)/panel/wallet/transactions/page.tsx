"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { fetchWalletOverview, type WalletTransaction } from "@/lib/wallet";
import { useMe } from "@/context/me-context";
import PaymentHistory from "../components/payment-history";
import { WalletHeader } from "../components/wallet-header";
import { WalletSidebar } from "../components/wallet-sidebar";

export default function WalletTransactionsPage() {
  const { me, isLoading: isProfileLoading } = useMe();
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const userName =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : (me?.email ?? "Account");

  useEffect(() => {
    let active = true;
    void fetchWalletOverview()
      .then((overview) => {
        if (active) setTransactions(overview.transactions);
      })
      .catch((failure) => {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load funding transactions.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PanelLayout>
      <div className="flex min-h-full bg-white">
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 lg:py-6">
          <WalletHeader />
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-7 hidden items-center gap-5 md:flex">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search transaction history</span>
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search transactions, merchants, or categories..."
                  className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
                />
              </label>
              <div className="flex shrink-0 items-center gap-3">
                <Image
                  src={me?.avatarUrl ?? "/profile.png"}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 rounded-lg bg-gray-100 object-cover"
                />
                <div>
                  <p className="text-sm font-gilroy-semibold text-gray-800">
                    {isProfileLoading ? "Loading..." : userName}
                  </p>
                  <p className="text-[11px] text-gray-400">Edit profile</p>
                </div>
              </div>
            </div>
            <header className="mb-5">
              <h1 className="text-2xl font-gilroy-semibold text-gray-900 sm:text-[28px]">
                Transaction History
              </h1>
            </header>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-5 shrink-0" /> {error}
              </div>
            ) : transactions ? (
              <PaymentHistory
                transactions={transactions}
                query={query}
                onQueryChange={setQuery}
              />
            ) : (
              <div className="flex min-h-96 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <Loader2 className="size-8 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </main>
      </div>
    </PanelLayout>
  );
}
