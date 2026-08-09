"use client";

import EditBudgetForm from "./components/edit-budget-form";
import { useParams } from "next/navigation";
import { getBudgetById } from "@/lib/mock-data";
import Link from "next/link";
import { PanelLayout } from "@/app/(dashboard)/panel/components/panel-layout";
import { BillingSidebar } from "../../../components/billing-sidebar";
import { BillingHeader } from "../../../components/billing-header";
import { useState } from "react";
import { AlertCircle, ArrowLeft, ChevronLeft, Pause } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditBudgetPage() {
  const params = useParams();
  const budgetId = params.budgetId as string;
  const budget = getBudgetById(budgetId);
  const [budgetStatus, setBudgetStatus] = useState<
    "running" | "paused" | "suspended" | "completed"
  >(budget?.status || "running");
  const [showPauseModal, setShowPauseModal] = useState(false);

  if (!budget) {
    return (
      <PanelLayout>
        <div className="flex h-full overflow-hidden bg-gray-50">
          <div className="hidden sm:block">
            <BillingSidebar />
          </div>
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-gilroy-semibold text-gray-900 mb-2">
              Budget not found
            </h1>
            <p className="text-gray-600 mb-4">
              The budget you're looking for doesn't exist.
            </p>
            <Link
              href="/panel/billing/budget"
              className="text-khaki-300 hover:text-khaki-400 font-gilroy-medium"
            >
              Back to budgets
            </Link>
          </div>
        </div>
      </PanelLayout>
    );
  }

  const handleStatusToggle = () => {
    if (budgetStatus === "running") {
      setShowPauseModal(true);
    } else if (budgetStatus === "paused") {
      setBudgetStatus("running");
    }
  };

  const confirmPauseBudget = () => {
    setBudgetStatus("paused");
    setShowPauseModal(false);
  };

  return (
    <PanelLayout>
      <div className="flex h-full overflow-hidden bg-gray-50">
        {/* Secondary Sidebar */}
        <div className="hidden sm:block">
          <BillingSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4 flex flex-col">
          <BillingHeader />

          {/* Budget header with breadcrumb and status */}
          <div className="bg-white rounded-lg shadow-sm border border-khaki-300 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-px sm:gap-2">
                <Link
                  href="/panel/billing"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
                >
                  Funding
                </Link>
                <span className="text-xs">&gt;&gt;</span>
                <Link
                  href="/panel/billing/budget"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
                >
                  Budget
                </Link>
                <span className="text-xs">&gt;&gt;</span>
                <span className="text-gray-900 font-gilroy-medium text-xs whitespace-nowrap">
                  {budget.name}
                </span>
              </div>
              {/* Status Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={budgetStatus === "running"}
                  onClick={handleStatusToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    budgetStatus === "running" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      budgetStatus === "running"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`capitalize py-1.5 px-2 rounded-lg text-sm font-gilroy-semibold ${
                    budgetStatus === "running"
                      ? "bg-green-500 text-white"
                      : budgetStatus === "paused"
                      ? "bg-slate-100 text-gray-700"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {budgetStatus === "running"
                    ? "Active"
                    : budgetStatus === "paused"
                    ? "Paused"
                    : budgetStatus === "suspended"
                    ? "Suspended"
                    : "Completed"}
                </span>
              </div>
            </div>
          </div>

          {/* Pause Confirmation Modal */}
          <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-center">
                  You&apos;re about to pause your budget
                </DialogTitle>
                <DialogDescription className="text-center">
                  This will stop your ad from being displayed to your audience.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center gap-3">
                <button
                  onClick={confirmPauseBudget}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-900 px-4 py-2 text-sm font-gilroy-medium text-slate-900"
                >
                  <Pause
                    className="w-3 h-3 text-black"
                    style={{ fill: "#000" }}
                  />
                  Pause
                </button>
                <button
                  onClick={() => setShowPauseModal(false)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2 text-sm font-gilroy-medium text-gray-900 transition-colors hover:bg-khaki-300"
                >
                  <ArrowLeft className="w-3 h-3 text-slate-800" />
                  Go back
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Budget Form */}
          <EditBudgetForm budget={budget} budgetStatus={budgetStatus} />
        </div>
      </div>
    </PanelLayout>
  );
}
