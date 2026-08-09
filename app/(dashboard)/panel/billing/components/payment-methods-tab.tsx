"use client";

import { useState } from "react";
import { AlertCircle, CreditCard, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  removePaymentMethod,
  setDefaultPaymentMethod,
  startPaymentMethodSetup,
  type PaymentMethod,
} from "@/lib/billing";

const USE_LABELS = {
  subscription: "Growdex subscription",
  funding: "Ad account funding",
  both: "Subscription and funding",
};

interface PaymentMethodsTabProps {
  methods: PaymentMethod[] | null;
  error: string | null;
  onChange: (methods: PaymentMethod[]) => void;
  onRetry: () => void;
}

export function PaymentMethodsTab({
  methods,
  error,
  onChange,
  onRetry,
}: PaymentMethodsTabProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const add = async () => {
    setAdding(true);
    try {
      const setupUrl = await startPaymentMethodSetup();
      window.location.href = setupUrl;
    } catch (failure) {
      toast.error(
        failure instanceof Error
          ? failure.message
          : "The payment method page could not open.",
      );
      setAdding(false);
    }
  };

  const run = async (
    id: string,
    action: (id: string) => Promise<PaymentMethod[]>,
    failureMessage: string,
  ) => {
    setBusyId(id);
    try {
      onChange(await action(id));
    } catch (failure) {
      toast.error(
        failure instanceof Error ? failure.message : failureMessage,
      );
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Payment methods unavailable</p>
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

  if (!methods) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-gilroy-semibold text-gray-950">
            Payment Methods
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
            Manage the payment methods you use for Growdex subscriptions and
            advertising account funding.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void add()}
          disabled={adding}
          className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add Payment Method
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <CreditCard className="mx-auto size-6 text-gray-300" />
          <p className="mt-3 text-sm font-gilroy-semibold text-gray-700">
            No payment methods yet
          </p>
          <p className="mt-1 text-xs text-dimGray">
            Add one to pay for Growdex and to fund your advertising accounts.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {methods.map((method) => (
            <li
              key={method.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white">
                  <CreditCard className="size-4 text-gray-500" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-gilroy-semibold text-gray-900">
                    {method.brand} •••• {method.last4}
                    {method.isDefault && (
                      <span className="ml-2 rounded-full bg-khaki-200 px-2 py-0.5 text-[10px] text-gray-900">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-dimGray">
                    Expires{" "}
                    {String(method.expiryMonth).padStart(2, "0")}/
                    {method.expiryYear} · {USE_LABELS[method.usedFor]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    type="button"
                    onClick={() =>
                      void run(
                        method.id,
                        setDefaultPaymentMethod,
                        "The default payment method could not be changed.",
                      )
                    }
                    disabled={busyId === method.id}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-gilroy-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    void run(
                      method.id,
                      removePaymentMethod,
                      "The payment method could not be removed.",
                    )
                  }
                  disabled={busyId === method.id}
                  className="rounded-lg px-3 py-1.5 text-xs font-gilroy-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {busyId === method.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
