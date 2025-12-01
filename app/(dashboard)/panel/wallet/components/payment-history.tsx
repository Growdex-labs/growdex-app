'use client';
import { useState } from "react";
import { Download, InfoIcon } from "lucide-react";
import { mockWalletTransactions } from "@/lib/mock-data";

export default function PaymentHistory() {
    const [selectedTransaction, setSelectedTransaction] = useState<number | null>(1);

    return (
        <div className="mt-8">
            {/* Payment History */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History</h2>
            <div className="flex gap-6">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-10 gap-4 bg-dimYellow border-b border-yellow-200 px-6 py-4 text-sm font-semibold text-gray-900">
                    <div className="col-span-2">Transaction ID</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Transaction type</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Status</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-gray-200">
                    {mockWalletTransactions.map((transaction, index) => (
                        <div
                        key={index}
                        className={`grid grid-cols-10 gap-4 px-6 py-4 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                            selectedTransaction === index ? 'bg-green-50 border-l-4 border-green-500' : ''
                        }`}
                        onClick={() => setSelectedTransaction(index)}
                        >
                        <div className="col-span-2 text-gray-900">{transaction.id}</div>
                        <div className="col-span-2 text-gray-600">{transaction.date}</div>
                        <div className="col-span-2 text-gray-900">{transaction.type}</div>
                        <div className="col-span-2 text-gray-900">{transaction.amount}</div>
                        <div className="col-span-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'Success' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'Failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                            }`}>
                            {transaction.status}
                            </span>
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
                        <small>Page</small>
                        <button className="px-3 py-1 rounded bg-khaki-200 text-gray-900 font-medium text-sm">1</button>
                        <button className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">2</button>
                        <span className="px-2 text-khaki-200">...</span>
                        <button className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">76</button>
                    </div>
                </div>
                {/* Transaction Details */}
                {selectedTransaction !== null && (
                <div className="space-y-4">
                    <div>
                        <button className="w-full bg-black-800 text-white px-4 py-5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-700 transition-colors">
                            <InfoIcon className='text-peru-200'/>
                            <span className='text-base text-dimYellow'>Details</span>
                        </button>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 space-y-4">
                        <div className="text-center bg-mintcream-50 px-2 py-3 rounded-xl">
                            <div className="inline-block px-4 py-1 bg-green-300 text-white rounded-full text-sm font-medium">
                                Success
                            </div>
                            <div className="text-2xl font-bold text-gray-900">₦20,000.00</div>
                            <div className="text-sm text-gray-600">2nd April 2025</div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Transaction Reference</div>
                                <div className="text-sm text-gray-900 break-all">CDS-235488909---0| 2ZE6661990000_debit_0</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 mb-1">Merchant</div>
                                <div className="text-sm text-gray-900">WTH| Paystack Titan</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 mb-1">Recipient</div>
                                <div className="text-sm text-gray-900">Amina Zubairu</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                                <div className="text-sm text-gray-900 break-all">233445556677 | 7878983VVEE86</div>
                            </div>
                        </div>

                        <button className="w-full bg-gray-900 hover:bg-gray-800 text-khaki-200 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Download className="w-4 h-4" />
                            Print invoice
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}
