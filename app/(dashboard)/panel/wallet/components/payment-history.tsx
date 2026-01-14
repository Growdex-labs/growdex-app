"use client";
import { useState } from "react";
import { Clipboard, Download, InfoIcon } from "lucide-react";
import { mockWalletTransactions } from "@/lib/mock-data";
import { EmptyState } from "../../components/empty-state";
import { DepositIcon } from "@/components/svg";

export default function PaymentHistory() {
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    1
  );

  return (
    <div className="mt-6 md:mt-8">
      {/* Payment History */}
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
        Payment History
      </h2>

      {/* Empty State */}
      {mockWalletTransactions.length === 0 ? (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex-1">
            {/* Table Header - Desktop Only */}
            <div className="hidden lg:grid grid-cols-10 gap-4 bg-dimYellow border-b border-yellow-200 px-6 py-4 text-sm font-semibold text-gray-900">
              <div className="col-span-2">Transaction ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Transaction type</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
            </div>

            {/* Table Rows - Desktop */}
            <div className="hidden lg:block divide-y my-16 divide-gray-200">
              <div className="flex flex-col items-center h-auto justify-center">
                <div className="mb-4 md:mb-6">
                  <Clipboard className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto" />
                </div>
                {/* Message */}
                <p className="text-sm md:text-base text-gray-500 text-center max-w-md mb-2">
                  Fund your wallet or pay for a campaign to see history
                </p>
                {/* Optional Action Button */}
                <button className="flex items-center gap-2 bg-khaki-200 text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-khaki-300 transition-colors">
                  <DepositIcon />
                  Fund Wallet
                </button>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className=" lg:hidden divide-y my-16 divide-gray-200">
              <div className="flex flex-col items-center h-auto justify-center">
                <div className="mb-4 md:mb-6">
                  <Clipboard className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto" />
                </div>
                {/* Message */}
                <p className="text-sm md:text-base text-gray-500 text-center max-w-md mb-2">
                  Fund your wallet or pay for a campaign to see history
                </p>
                {/* Optional Action Button */}
                <button className="flex items-center gap-2 bg-khaki-200 text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-khaki-300 transition-colors">
                  <DepositIcon />
                  Fund Wallet
                </button>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-4 border-t border-gray-200">
              <small className="text-xs md:text-sm">Page</small>
              <button className="px-2 md:px-3 py-1 rounded bg-khaki-200 text-gray-900 font-medium text-xs md:text-sm">
                1
              </button>
              <button className="px-2 md:px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs md:text-sm">
                2
              </button>
              <span className="px-1 md:px-2 text-khaki-200 text-xs md:text-sm">
                ...
              </span>
              <button className="px-2 md:px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs md:text-sm">
                76
              </button>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 md:space-y-4 lg:w-80 lg:shrink-0">
            <div>
              <button className="w-full bg-black-800 text-white px-4 py-4 md:py-5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
                <InfoIcon className="text-peru-200 w-4 h-4" />
                <span className="text-sm md:text-base text-dimYellow">
                  Details
                </span>
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl  p-3 md:p-4 space-y-3 md:space-y-4">
              <div className="my-80" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex-1">
            {/* Table Header - Desktop Only */}
            <div className="hidden lg:grid grid-cols-10 gap-4 bg-dimYellow border-b border-yellow-200 px-6 py-4 text-sm font-semibold text-gray-900">
              <div className="col-span-2">Transaction ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Transaction type</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
            </div>

            {/* Table Rows - Desktop */}
            <div className="hidden lg:block divide-y divide-gray-200">
              {mockWalletTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-10 gap-4 px-6 py-4 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedTransaction === index
                      ? "bg-green-50 border-l-4 border-green-500"
                      : ""
                  }`}
                  onClick={() => setSelectedTransaction(index)}
                >
                  <div className="col-span-2 text-gray-900">
                    {transaction.id}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {transaction.date}
                  </div>
                  <div className="col-span-2 text-gray-900">
                    {transaction.type}
                  </div>
                  <div className="col-span-2 text-gray-900">
                    {transaction.amount}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "Success"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "Failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {mockWalletTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedTransaction === index
                      ? "bg-green-50 border-l-4 border-green-500"
                      : ""
                  }`}
                  onClick={() => setSelectedTransaction(index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Transaction ID
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "Success"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "Failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="text-sm text-gray-900">
                        {transaction.date}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Type</div>
                      <div className="text-sm text-gray-900">
                        {transaction.type}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Amount</div>
                    <div className="text-base font-semibold text-gray-900">
                      {transaction.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-4 border-t border-gray-200">
              <small className="text-xs md:text-sm">Page</small>
              <button className="px-2 md:px-3 py-1 rounded bg-khaki-200 text-gray-900 font-medium text-xs md:text-sm">
                1
              </button>
              <button className="px-2 md:px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs md:text-sm">
                2
              </button>
              <span className="px-1 md:px-2 text-khaki-200 text-xs md:text-sm">
                ...
              </span>
              <button className="px-2 md:px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs md:text-sm">
                76
              </button>
            </div>
          </div>

          {/* Transaction Details */}
          {selectedTransaction !== null && (
            <div className="space-y-3 md:space-y-4 lg:w-80 lg:shrink-0">
              <div>
                <button className="w-full bg-black-800 text-white px-4 py-4 md:py-5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
                  <InfoIcon className="text-peru-200 w-4 h-4" />
                  <span className="text-sm md:text-base text-dimYellow">
                    Details
                  </span>
                </button>
              </div>

              <div className="bg-gray-100 rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
                <div className="text-center bg-mintcream-50 px-2 py-3 md:py-4 rounded-xl">
                  <div className="inline-block px-3 md:px-4 py-1 bg-green-300 text-white rounded-full text-xs md:text-sm font-medium">
                    Success
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
                    ₦20,000.00
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">
                    2nd April 2025
                  </div>
                </div>

                <div className="space-y-2.5 md:space-y-3 pt-3 md:pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Transaction Reference
                    </div>
                    <div className="text-xs md:text-sm text-gray-900 break-all">
                      CDS-235488909---0| 2ZE6661990000_debit_0
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Merchant</div>
                    <div className="text-xs md:text-sm text-gray-900">
                      WTH| Paystack Titan
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Recipient</div>
                    <div className="text-xs md:text-sm text-gray-900">
                      Amina Zubairu
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Transaction ID
                    </div>
                    <div className="text-xs md:text-sm text-gray-900 break-all">
                      233445556677 | 7878983VVEE86
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gray-900 hover:bg-gray-800 text-khaki-200 py-2.5 md:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base">
                  <Download className="w-4 h-4" />
                  Print invoice
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
