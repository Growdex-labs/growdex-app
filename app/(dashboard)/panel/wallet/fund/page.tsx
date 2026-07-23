"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { apiFetch } from "@/lib/auth";
import { useMe } from "@/context/me-context";
import { WalletHeader } from "../components/wallet-header";
import { WalletSidebar } from "../components/wallet-sidebar";

type Platform = "meta" | "tiktok";

type BillingOption = {
  platform: Platform;
  accountId?: string;
  accountName?: string;
  currency?: string | null;
  billingUrl?: string;
  error?: string;
};

const billingOptionKey = (option: BillingOption) =>
  `${option.platform}:${option.accountId ?? "unavailable"}`;

const PLATFORM_CONFIG = {
  meta: {
    name: "Meta",
    logo: "/logos_meta-icon.png",
    avatarClass: "bg-blue-600",
  },
  tiktok: {
    name: "TikTok",
    logo: "/logos_tiktok-icon.png",
    avatarClass: "bg-gray-900",
  },
} satisfies Record<
  Platform,
  { name: string; logo: string; avatarClass: string }
>;

function FundingCard({
  platform,
  accountName,
  accountId,
  currency,
  canFund,
  loading,
  error,
  onFund,
}: {
  platform: Platform;
  accountName: string;
  accountId?: string;
  currency?: string | null;
  canFund: boolean;
  loading: boolean;
  error?: string | null;
  onFund: () => void;
}) {
  const config = PLATFORM_CONFIG[platform];
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <span
          className={`flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ${config.avatarClass}`}
        >
          {accountName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-gilroy-semibold text-gray-900">
            {accountName}
          </p>
          <p className="text-xs text-gray-400">
            {[config.name, accountId, currency].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex min-h-52 items-center justify-center bg-gray-50">
        <Image src={config.logo} alt={config.name} width={88} height={88} />
      </div>

      {error && (
        <div className="flex items-start gap-2 border-t border-red-100 bg-red-50 px-5 py-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
        <span className="text-xs text-gray-500">Connected ad account</span>
        <button
          type="button"
          onClick={onFund}
          disabled={loading || !canFund}
          className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2 text-xs font-gilroy-semibold text-gray-900 transition-colors hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
          {loading ? "Opening…" : "Continue to platform"}
        </button>
      </div>
    </article>
  );
}

export default function FundWalletPage() {
  const { isLoading: meLoading } = useMe();
  const [billingOptions, setBillingOptions] = useState<BillingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (meLoading) return;
    let active = true;
    const loadBillingLinks = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const response = await apiFetch("/users/ad-accounts/billing", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`Billing options failed (${response.status}).`);
        }
        const data = (await response.json()) as BillingOption[];
        if (active) {
          setBillingOptions(data);
          setCardErrors(
            Object.fromEntries(
              data.map((item) => [billingOptionKey(item), item.error ?? null]),
            ),
          );
        }
      } catch (failure) {
        if (active) {
          setPageError(
            failure instanceof Error
              ? failure.message
              : "Could not load billing options.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadBillingLinks();
    return () => {
      active = false;
    };
  }, [meLoading]);

  const handleFund = (option: BillingOption) => {
    const key = billingOptionKey(option);
    const billingUrl = option.billingUrl;
    if (!billingUrl) {
      setCardErrors((current) => ({
        ...current,
        [key]: `No billing link is available for ${PLATFORM_CONFIG[option.platform].name}.`,
      }));
      return;
    }

    setCardErrors((current) => ({ ...current, [key]: null }));
    window.location.assign(billingUrl);
  };

  return (
    <PanelLayout>
      <div className="flex min-h-full bg-[#f5f5f5]">
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          <WalletHeader />
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-gilroy-bold text-gray-950">
              Add campaign funding
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose an account, then continue securely on the platform’s
              billing page.
            </p>

            {pageError ? (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {pageError}
              </div>
            ) : loading ? (
              <div className="mt-8 flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <Loader2 className="size-8 animate-spin text-gray-400" />
              </div>
            ) : billingOptions.length ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {billingOptions.map((option) => {
                  const key = billingOptionKey(option);
                  return (
                    <FundingCard
                      key={key}
                      platform={option.platform}
                      accountName={
                        option.accountName ??
                        PLATFORM_CONFIG[option.platform].name
                      }
                      accountId={option.accountId}
                      currency={option.currency}
                      canFund={Boolean(option.billingUrl)}
                      loading={false}
                      error={cardErrors[key]}
                      onFund={() => handleFund(option)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <AlertCircle className="mx-auto size-8 text-gray-400" />
                <h2 className="mt-3 font-gilroy-semibold text-gray-900">
                  No connected ad accounts
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Connect Meta or TikTok in settings before funding an account.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

    </PanelLayout>
  );
}
