"use client";

import { AlertCircle, Download, Loader2, Receipt } from "lucide-react";
import {
  formatInvoiceDate,
  formatPlanPrice,
  type Invoice,
} from "@/lib/billing";

const STATUS_STYLES = {
  paid: "bg-emerald-100 text-emerald-700",
  open: "bg-amber-100 text-amber-700",
  refunded: "bg-gray-200 text-gray-700",
};

interface InvoicesTabProps {
  invoices: Invoice[] | null;
  error: string | null;
  onRetry: () => void;
}

export function InvoicesTab({ invoices, error, onRetry }: InvoicesTabProps) {
  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-gilroy-semibold">Billing history unavailable</p>
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

  if (!invoices) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 lg:px-6">
        <h2 className="font-gilroy-semibold text-gray-950">
          Growdex Billing History
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Subscription charges, renewals, and refunds. Advertising spend is
          under Transactions.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {invoices.length === 0 ? (
          <div className="px-5 py-12 text-center lg:px-6">
            <Receipt className="mx-auto size-6 text-gray-300" />
            <p className="mt-3 text-sm font-gilroy-semibold text-gray-700">
              No Growdex charges yet
            </p>
            <p className="mt-1 text-xs text-dimGray">
              Your subscription invoices will appear here.
            </p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-sm lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:px-6"
            >
              <div className="min-w-0">
                <p className="truncate font-gilroy-semibold text-gray-900">
                  {invoice.description}
                </p>
                <p className="truncate text-xs text-dimGray">
                  {invoice.number}
                </p>
              </div>
              <span className="hidden text-gray-500 lg:block">
                {formatInvoiceDate(invoice.date)}
              </span>
              <span className="hidden font-gilroy-semibold text-gray-900 lg:block">
                {formatPlanPrice(invoice.amount, invoice.currency)}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-gilroy-semibold capitalize ${STATUS_STYLES[invoice.status]}`}
                >
                  {invoice.status}
                </span>
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gray-400 transition-colors hover:text-gray-700"
                    aria-label={`Download invoice ${invoice.number}`}
                  >
                    <Download className="size-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
