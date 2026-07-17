"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { fetchWalletOverview, type WalletTransaction } from "@/lib/wallet";
import PaymentHistory from "../components/payment-history";
import { WalletHeader } from "../components/wallet-header";
import { WalletSidebar } from "../components/wallet-sidebar";

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
              : "Could not load wallet transactions.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PanelLayout>
      <div className="flex min-h-full bg-[#f5f5f5]">
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <WalletHeader />
          <div className="mx-auto max-w-7xl">
            <header className="mb-5">
              <p className="text-sm text-gray-400">Wallet</p>
              <h1 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
                Transaction history
              </h1>
            </header>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-5 shrink-0" /> {error}
              </div>
            ) : transactions ? (
              <PaymentHistory transactions={transactions} />
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
