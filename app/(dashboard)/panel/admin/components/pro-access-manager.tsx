"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/auth";

type ProGrantResult = {
  changed: boolean;
  account: {
    id: string;
    email: string;
  };
  subscription: {
    plan: "pro";
    status: "active";
    priceMonthly: number;
    currency: string;
    renewsAt: string | null;
    complimentary: boolean;
  };
};

const errorMessage = (value: unknown) => {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }
  return "Pro access could not be granted.";
};

export function ProAccessManager() {
  const [email, setEmail] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [granting, setGranting] = useState(false);
  const [lastResult, setLastResult] = useState<ProGrantResult | null>(null);

  const reviewGrant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setReviewEmail(normalizedEmail);
    setDialogOpen(true);
  };

  const grantPro = async () => {
    setGranting(true);
    try {
      const response = await apiFetch("/users/admin/pro-grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: reviewEmail }),
      });
      const body = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok) {
        throw new Error(errorMessage(body));
      }

      const result = body as ProGrantResult;
      setLastResult(result);
      setEmail("");
      setDialogOpen(false);
      toast.success(
        result.changed
          ? `${result.account.email} now has complimentary Pro access.`
          : `${result.account.email} already has active Pro access.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage(error));
    } finally {
      setGranting(false);
    }
  };

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-black/5 bg-[#d9ff72] shadow-sm">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute -bottom-16 -right-12 size-52 rounded-full border-[28px] border-gray-950/5" />
            <div className="relative">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gray-950 text-[#d9ff72]">
                <Crown className="size-5" />
              </span>
              <p className="mt-7 text-xs font-gilroy-semibold uppercase tracking-[0.16em] text-gray-700">
                Access desk
              </p>
              <h2 className="mt-2 max-w-sm text-2xl font-gilroy-bold leading-tight text-gray-950 sm:text-3xl">
                Give an account complimentary Pro
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-gray-700">
                Turn on every Pro feature without charging the account or
                creating an invoice.
              </p>
            </div>
          </div>

          <div className="m-2 rounded-[1.6rem] bg-white p-5 sm:m-3 sm:p-6">
            <form onSubmit={reviewGrant}>
              <label
                htmlFor="pro-grant-email"
                className="text-sm font-gilroy-semibold text-gray-950"
              >
                Growdex account email
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="pro-grant-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="customer@example.com"
                    autoComplete="off"
                    required
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-950 outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-gilroy-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
                >
                  Review grant <ArrowRight className="size-4" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-dimGray">
                Enter the exact email used on the account. Paid Pro
                subscriptions stay unchanged.
              </p>
            </form>

            {lastResult && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-gilroy-semibold text-emerald-950">
                    {lastResult.changed
                      ? "Pro access granted"
                      : "Pro was already active"}
                  </p>
                  <p className="mt-0.5 break-all text-xs text-emerald-800">
                    {lastResult.account.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!granting) setDialogOpen(open);
        }}
      >
        <DialogContent showCloseButton={!granting} className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-[#d9ff72] text-gray-950">
              <ShieldCheck className="size-5" />
            </div>
            <DialogTitle>Grant complimentary Pro?</DialogTitle>
            <DialogDescription className="leading-6">
              This immediately turns on all Pro features for{" "}
              <span className="break-all font-gilroy-semibold text-gray-900">
                {reviewEmail}
              </span>
              . The account will not be charged and no invoice will be created.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-600">
            If this account already has an active paid Pro subscription, its
            billing details will remain unchanged.
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              disabled={granting}
              className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-gilroy-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={grantPro}
              disabled={granting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-gilroy-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {granting && <Loader2 className="size-4 animate-spin" />}
              {granting ? "Granting Pro…" : "Grant Pro access"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
