"use client";

import Link from "next/link";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import {
  formatWalletMoney,
  type WalletCurrency,
  type WalletOverview,
  type WalletPlatform,
} from "@/lib/wallet";
import type { SocialAccountSetupProps } from "@/types/social";

const PLATFORMS: Array<{ id: WalletPlatform; name: string }> = [
  { id: "meta", name: "Meta" },
  { id: "tiktok", name: "TikTok" },
];

interface AdAccountsTabProps {
  overview: WalletOverview | null;
  accounts: SocialAccountSetupProps | null;
  error: string | null;
  onRetry: () => void;
}

const accountName = (
  accounts: SocialAccountSetupProps | null,
  platform: WalletPlatform,
) => {
  if (platform === "meta") {
    return accounts?.meta?.assets?.[0]?.adAccountName ?? "Meta ad account";
  }
  return accounts?.tiktok?.assets?.[0]?.name ?? "TikTok ad account";
};

export function AdAccountsTab({
  overview,
  accounts,
  error,
  onRetry,
}: AdAccountsTabProps) {
  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Advertising accounts unavailable</p>
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
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Money here pays the advertising platforms. It is separate from your
        Growdex subscription.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const connected = Boolean(accounts?.[platform.id]?.connected);
          const balance = overview.adAccounts.find(
            (account) => account.platform === platform.id,
          );

          if (!connected) {
            return (
              <section
                key={platform.id}
                className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 lg:p-6"
              >
                <h2 className="font-gilroy-semibold text-gray-950">
                  {platform.name} isn&apos;t connected yet.
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Connect your {platform.name} ad account to manage campaigns
                  and funding from Growdex.
                </p>
                <Link
                  href="/panel/integrations"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
                >
                  <Plus className="size-4" /> Connect {platform.name}
                </Link>
              </section>
            );
          }

          const currency: WalletCurrency = balance?.currency ?? "NGN";

          return (
            <section
              key={platform.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-gilroy-semibold text-gray-950">
                  {platform.name}
                </h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-gilroy-semibold text-emerald-700">
                  Connected
                </span>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-gray-500">Ad Account</dt>
                  <dd className="min-w-0 truncate text-gray-900">
                    {balance?.accountName ?? accountName(accounts, platform.id)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-gray-500">Balance Due</dt>
                  <dd className="font-gilroy-bold text-gray-950">
                    {formatWalletMoney(balance?.balance ?? 0, currency)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-gray-500">Currency</dt>
                  <dd className="font-gilroy-semibold text-gray-900">
                    {currency}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={`/panel/billing/fund?platform=${platform.id}`}
                  className="rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
                >
                  Fund Account
                </Link>
                <Link
                  href={`/panel/billing?tab=transactions&platform=${platform.id}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-gilroy-semibold text-gray-800 hover:bg-gray-50"
                >
                  View Transactions
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
