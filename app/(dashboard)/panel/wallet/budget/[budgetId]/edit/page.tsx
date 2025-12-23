"use client";

import EditBudgetForm from "./components/edit-budget-form";
import { useParams } from "next/navigation";
import { getBudgetById } from "@/lib/mock-data";
import Link from "next/link";
import { PanelLayout } from "@/app/(dashboard)/panel/components/panel-layout";
import { WalletSidebar } from "../../../components/wallet-sidebar";
import { WalletHeader } from "../../../components/wallet-header";
import { useState } from "react";
import { AlertCircle, ArrowLeft, ChevronLeft, Pause } from "lucide-react";

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
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <div className="hidden sm:block">
            <WalletSidebar />
          </div>
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Budget not found
            </h1>
            <p className="text-gray-600 mb-4">
              The budget you're looking for doesn't exist.
            </p>
            <Link
              href="/panel/wallet/budget"
              className="text-khaki-300 hover:text-khaki-400 font-medium"
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
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar */}
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4 flex flex-col">
          <WalletHeader />

          {/* Budget header with breadcrumb and status */}
          <div className="bg-white rounded-lg shadow-sm border border-khaki-300 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-px sm:gap-2">
                <Link
                  href="/panel/wallet"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
                >
                  Wallet
                </Link>
                <span className="text-xs">&gt;&gt;</span>
                <Link
                  href="/panel/wallet/budget"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
                >
                  Budget
                </Link>
                <span className="text-xs">&gt;&gt;</span>
                <span className="text-gray-900 font-medium text-xs whitespace-nowrap">
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
                  className={`capitalize py-1.5 px-2 rounded-lg text-sm font-semibold ${
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
          {showPauseModal && (
            <div className="fixed inset-0 bg-slate-800/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
                <h2 className="text-center mb-4 text-lg font-semibold">
                  You're about to pause your budget
                </h2>
                <p className="text-center mb-4 text-gray-700 text-sm">
                  This will stop your ad from being displayed to your audience.
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={confirmPauseBudget}
                    className="px-4 py-2 text-slate-900 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-900 cursor-pointer"
                  >
                    <Pause
                      className="w-3 h-3 text-black"
                      style={{ fill: "#000" }}
                    />
                    Pause
                  </button>
                  <button
                    onClick={() => setShowPauseModal(false)}
                    className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm flex items-center gap-2 font-medium transition-colors cursor-pointer hover:bg-khaki-300"
                  >
                    <ArrowLeft className="w-3 h-3 text-slate-800" />
                    Go back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Budget Form */}
          <EditBudgetForm budget={budget} budgetStatus={budgetStatus} />
        </div>
      </div>
    </PanelLayout>
  );
}
