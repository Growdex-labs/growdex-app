import { Pencil } from "lucide-react";
// TODO: Add Budget type
import Link from "next/link";

const suspendedBudgets = [
  {
    id: "1",
    name: "Product Launch",
    icon: "/ic_baseline-plus.png",
    status: "suspended",
    usedPercent: 45,
    amount: 180000.0,
    isActive: false,
  },
  {
    id: "2",
    name: "Holiday Campaign",
    icon: "/ic_baseline-plus.png",
    status: "suspended",
    usedPercent: 80,
    amount: 300000.0,
    isActive: false,
  },
];

export default function SuspendedBudget() {
  return (
    <div className="space-y-3 md:space-y-4 mt-4">
      {suspendedBudgets.map((budget) => (
        <div
          key={budget.id}
          className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-md transition-shadow"
        >
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Budget Icon */}
            <div className="w-14 h-14 bg-gray-100 border border-khaki-200 rounded-full flex items-center justify-center flex-shrink-0">
              {budget.icon ? (
                <img
                  src={budget.icon}
                  alt={budget.name}
                  className="w-11 h-11 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              )}
            </div>

            {/* Budget Name */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {budget.name}
              </h3>
            </div>

            {/* Amount */}
            <div className="text-lg font-semibold text-gray-900 whitespace-nowrap">
              ₦
              {budget.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            {/* Status Badge */}
            <div>
              <span
                className={`px-6 py-2 rounded-lg text-sm font-medium ${
                  budget.isActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {budget.isActive ? "Active" : "Paused"}
              </span>
            </div>

            {/* Edit Button */}
            <Link
              href={`/panel/wallet/budget/${budget.id}/edit`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Pencil className="w-5 h-5 text-darkkhaki-200" />
            </Link>
          </div>

          {/* Mobile Layout - Card Style */}
          <div className="md:hidden flex justify-between items-center gap-3">
            <div className="flex flex-col gap-3 ">
              {/* Budget Icon & Info */}
              <div className="flex gap-3 flex-1">
                <div className="w-10 h-10 bg-gray-100 border border-khaki-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {budget.icon ? (
                    <img
                      src={budget.icon}
                      alt={budget.name}
                      className="w-9 h-9 object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  )}
                </div>

                {/* Budget Info */}
                <div className="flex gap-2 items-center">
                  <h3 className="text-sm font-semibold text-gray-900 truncate ">
                    {budget.name}
                  </h3>
                  {/* Edit Button - Mobile */}
                  <Link
                    href={`/panel/wallet/budget/${budget.id}/edit`}
                    className=" hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Pencil className="w-3 h-3 text-darkkhaki-200" />
                  </Link>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  {/* Smaller progress circle on mobile; still uses viewBox so it scales */}
                  <svg
                    viewBox="0 0 48 48"
                    className="w-8 h-8 md:w-10 md:h-10 transform -rotate-90"
                  >
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={
                        budget.status === "suspended" ? "#332c00" : "#D6C34A"
                      }
                      strokeWidth="4"
                      fill="none"
                      {...(budget.status === "suspended"
                        ? { strokeOpacity: 0.12 }
                        : {})}
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={
                        budget.status === "suspended"
                          ? "#D6C34A"
                          : budget.usedPercent > 70
                          ? "#EF4444"
                          : budget.usedPercent > 50
                          ? "#FBBF24"
                          : "#10B981"
                      }
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${
                        (budget.usedPercent / 100) * 125.6
                      } 125.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  <span className="font-medium">{budget.status}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="font-medium">
                    {budget.usedPercent}% used
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 items-end">
              {/* Status Badge - Mobile */}
              <div className="flex flex-col flex-1 items-end gap-1 mb-5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    budget.isActive
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {budget.isActive ? "Active" : "Paused"}
                </span>
              </div>

                {/* Amount - Mobile */}
                <div className="text-sm text-gray-700 whitespace-nowrap">
                    ₦
                    {budget.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {suspendedBudgets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No budgets found. Create your first budget to get started.</p>
        </div>
      )}
    </div>
  );
}
