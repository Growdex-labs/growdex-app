"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PanelLayout } from "../components/panel-layout";
import { useMe } from "@/context/me-context";
import { getTimeBasedGreeting } from "@/lib/greeting";
import {
  fetchInvoices,
  fetchPaymentMethods,
  fetchSubscription,
  type Invoice,
  type PaymentMethod,
  type Subscription,
} from "@/lib/billing";
import { fetchWalletOverview, type WalletOverview } from "@/lib/wallet";
import { hydrateSocialAccounts } from "@/lib/social";
import type { SocialAccountSetupProps } from "@/types/social";
import { SubscriptionTab } from "./components/subscription-tab";
import { AdAccountsTab } from "./components/ad-accounts-tab";
import {
  TransactionsTab,
  type TransactionFilter,
} from "./components/transactions-tab";
import { PaymentMethodsTab } from "./components/payment-methods-tab";
import { InvoicesTab } from "./components/invoices-tab";

const TABS = [
  { id: "subscription", label: "Subscription" },
  { id: "ad-accounts", label: "Ad Accounts" },
  { id: "transactions", label: "Transactions" },
  { id: "payment-methods", label: "Payment Methods" },
  { id: "invoices", label: "Invoices" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const isTabId = (value: string | null): value is TabId =>
  TABS.some((tab) => tab.id === value);

const isTransactionFilter = (
  value: string | null,
): value is TransactionFilter =>
  value === "meta" || value === "tiktok" || value === "funding" || value === "refunds";

const errorMessage = (failure: unknown, fallback: string) =>
  failure instanceof Error ? failure.message : fallback;

function BillingWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me } = useMe();

  const tabParam = searchParams.get("tab");
  const activeTab: TabId = isTabId(tabParam) ? tabParam : "subscription";
  const platformParam = searchParams.get("platform");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null,
  );
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<SocialAccountSetupProps | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setSubscriptionError(null);
      setOverviewError(null);
      setMethodsError(null);
      setInvoicesError(null);

      const [
        subscriptionResult,
        overviewResult,
        accountsResult,
        methodsResult,
        invoicesResult,
      ] = await Promise.allSettled([
        fetchSubscription(),
        fetchWalletOverview(),
        hydrateSocialAccounts(),
        fetchPaymentMethods(),
        fetchInvoices(),
      ]);

      if (!active) return;

      if (subscriptionResult.status === "fulfilled") {
        setSubscription(subscriptionResult.value);
      } else {
        setSubscriptionError(
          errorMessage(
            subscriptionResult.reason,
            "Could not load your plan and usage.",
          ),
        );
      }

      if (overviewResult.status === "fulfilled") {
        setOverview(overviewResult.value);
      } else {
        setOverviewError(
          errorMessage(
            overviewResult.reason,
            "Could not load advertising account funding.",
          ),
        );
      }

      if (accountsResult.status === "fulfilled" && accountsResult.value.data) {
        setAccounts(accountsResult.value.data);
      }

      if (methodsResult.status === "fulfilled") {
        setMethods(methodsResult.value);
      } else {
        setMethodsError(
          errorMessage(
            methodsResult.reason,
            "Could not load your payment methods.",
          ),
        );
      }

      if (invoicesResult.status === "fulfilled") {
        setInvoices(invoicesResult.value);
      } else {
        setInvoicesError(
          errorMessage(
            invoicesResult.reason,
            "Could not load your Growdex billing history.",
          ),
        );
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const selectTab = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("platform");
    router.replace(`/panel/billing?${params.toString()}`, { scroll: false });
  };

  const firstName = me?.profile?.firstName ?? "there";

  return (
    <PanelLayout>
      <div className="min-h-full bg-[#f5f5f5] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <header>
            <p className="text-sm text-dimGray">Billing</p>
            <h1 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
              {getTimeBasedGreeting()}, {firstName}!
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Growdex subscription billing, advertising spend, and ad-account
              funding are three separate things. This page keeps them apart.
            </p>
          </header>

          <nav className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-khaki-200 font-gilroy-semibold text-gray-950"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "subscription" && (
            <SubscriptionTab
              subscription={subscription}
              error={subscriptionError}
              onRetry={reload}
            />
          )}

          {activeTab === "ad-accounts" && (
            <AdAccountsTab
              overview={overview}
              accounts={accounts}
              error={overviewError}
              onRetry={reload}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsTab
              overview={overview}
              error={overviewError}
              initialFilter={
                isTransactionFilter(platformParam) ? platformParam : "all"
              }
              onRetry={reload}
            />
          )}

          {activeTab === "payment-methods" && (
            <PaymentMethodsTab
              methods={methods}
              error={methodsError}
              onChange={setMethods}
              onRetry={reload}
            />
          )}

          {activeTab === "invoices" && (
            <InvoicesTab
              invoices={invoices}
              error={invoicesError}
              onRetry={reload}
            />
          )}
        </div>
      </div>
    </PanelLayout>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <PanelLayout>
          <div className="flex h-full items-center justify-center bg-[#f5f5f5]">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
          </div>
        </PanelLayout>
      }
    >
      <BillingWorkspace />
    </Suspense>
  );
}
