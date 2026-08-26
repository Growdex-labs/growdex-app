"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  formatPlanPrice,
  formatUsage,
  startProCheckout,
  usagePercent,
  PRO_PLAN_CURRENCY,
  PRO_PLAN_FEATURES,
  PRO_PLAN_PRICE,
  type PlanLimit,
  type Subscription,
} from "@/lib/billing";

const USAGE_ROWS: Array<{ label: string; key: keyof Subscription["usage"] }> = [
  { label: "Active Campaigns", key: "activeCampaigns" },
  { label: "AI Chat", key: "aiChat" },
  { label: "AI Campaign Generations", key: "aiCampaignGenerations" },
  { label: "AI Copy Generations", key: "aiCopyGenerations" },
];

function UsageRow({ label, value }: { label: string; value: PlanLimit }) {
  const percent = usagePercent(value);

  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-gilroy-semibold text-gray-900">
          {formatUsage(value)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-khaki-200"
          style={{ width: `${value.limit === null ? 100 : percent}%` }}
        />
      </div>
    </li>
  );
}

interface SubscriptionTabProps {
  subscription: Subscription | null;
  error: string | null;
  onRetry: () => void;
}

export function SubscriptionTab({
  subscription,
  error,
  onRetry,
}: SubscriptionTabProps) {
  const [upgrading, setUpgrading] = useState(false);

  const subscribe = async () => {
    setUpgrading(true);
    try {
      const checkoutUrl = await startProCheckout();
      window.location.href = checkoutUrl;
    } catch (failure) {
      toast.error(
        failure instanceof Error
          ? failure.message
          : "Checkout could not start right now.",
      );
      setUpgrading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Subscription unavailable</p>
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

  if (!subscription) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isPro = subscription.plan === "pro";

  return (
    <div className={isPro ? "grid gap-4 lg:grid-cols-2" : undefined}>
      {isPro && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
          <p className="text-sm text-dimGray">Current plan</p>
          <div className="mt-2 flex items-baseline gap-3">
            <h2 className="text-2xl font-gilroy-bold text-gray-950">Pro</h2>
            <span className="text-sm text-gray-500">
              {formatPlanPrice(subscription.priceMonthly, subscription.currency)}
              /month
            </span>
          </div>
          {subscription.renewsAt && (
            <p className="mt-1 text-xs text-dimGray">
              Renews{" "}
              {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
                new Date(subscription.renewsAt),
              )}
            </p>
          )}

          <h3 className="mt-6 text-sm font-gilroy-semibold text-gray-900">
            Usage
          </h3>
          <ul className="mt-4 space-y-4">
            {USAGE_ROWS.map((row) => (
              <UsageRow
                key={row.key}
                label={row.label}
                value={subscription.usage[row.key]}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-gilroy-bold text-gray-950">Pro</h2>
          <span className="text-sm text-gray-500">
            {formatPlanPrice(PRO_PLAN_PRICE, PRO_PLAN_CURRENCY)}/month
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          For businesses, marketers, freelancers, and growing teams.
        </p>

        <ul className="mt-5 space-y-2.5">
          {PRO_PLAN_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
              <Check className="mt-0.5 size-4 shrink-0 text-peru-200" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => void subscribe()}
          disabled={upgrading || isPro}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-khaki-200 px-4 py-3 text-sm font-gilroy-semibold text-gray-950 transition-colors hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {upgrading && <Loader2 className="size-4 animate-spin" />}
          {isPro
            ? "You are on Pro"
            : `Subscribe — ${formatPlanPrice(PRO_PLAN_PRICE, PRO_PLAN_CURRENCY)}/month`}
        </button>
      </section>
    </div>
  );
}
