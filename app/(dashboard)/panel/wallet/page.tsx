'use client';

import { DashboardHeader } from '../components/dashboard-header';
import { PanelLayout } from '../components/panel-layout';
import { WalletSidebar } from './components/wallet-sidebar';
import { Plus } from 'lucide-react';
import { DepositIcon } from '@/components/svg';
import PaymentHistory from './components/payment-history';

export default function WalletPage() {

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar */}
        <WalletSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
                {/* Dashboard Header */}
                <DashboardHeader />

                <div className="mt-8 flex gap-6">
                    {/* Left Section - Wallet Balance and Card */}
                    <div className="lg:flex-1">
                        {/* Wallet Balance Card */}
                        <div className="grid grid-cols-2 bg-dimYellow border border-yellow-200 rounded-2xl p-6">
                            {/* Balance Section */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <img src="/dollar-sign.png" alt="dollar-sign" />
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-600 mb-1">Wallet Balance</div>
                                        <div className="text-2xl font-semibold text-gray-900 mb-4">₦30,000,000.00</div>
                                    </div>
                                </div>

                                {/* Fund Allocation */}
                                <div className="space-y-2 mb-4">
                                    <div className="text-xs text-peru-200">
                                    Fund allocation <span className="bg-gray-600 text-khaki-200 px-2 py-0.5 rounded-full text-xs ml-2">62%/30%</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">₦17,000,000.00</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">₦13,000,000.00</span>
                                    </div>
                                    </div>
                                </div>

                                {/* Fund Wallet Button */}
                                <button className="w-[90%] bg-khaki-200 hover:bg-khaki-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <DepositIcon />
                                    Fund Wallet
                                </button>
                            </div>

                            {/* Credit Card Display */}
                            <div className="">
                            <div className="bg-[url('/bank-card-bg.png')] bg-cover bg-center bg-no-repeat rounded-xl p-6 text-white shadow-xl h-44 relative overflow-hidden">

                                <div className="relative h-full flex flex-col justify-between">
                                {/* Card Number */}
                                <div className="text-lg tracking-widest">**** **** **** 7223</div>

                                {/* Card Holder and Expiry */}
                                <div className="flex justify-between items-end">
                                    <div>
                                    <div className="text-xs text-gray-400 mb-1">Card Holder</div>
                                    <div className="text-sm font-medium">Gina Ademola</div>
                                    </div>
                                    <div className="text-right">
                                    <div className="text-xs text-gray-400 mb-1">Expires</div>
                                    <div className="text-sm font-medium">03/26</div>
                                    </div>
                                </div>

                                {/* Mastercard Logo */}
                                <div className="absolute top-4 right-4">
                                    <div className="flex gap-[-8px]">
                                    <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                                    <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-4"></div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    {/* Right Section - Saved Cards */}
                    <div className="border w-48 space-y-6 p-2 rounded-xl bg-gray-100">
                        {/* Saved Cards */}
                        <div className="space-y-3">
                        <div className="bg-white border border-khaki-200 rounded-lg p-4 flex items-center justify-between">
                            <span className="text-gray-600 tracking-wider">**** 7223</span>
                            <div className="flex gap-[-4px]">
                            <div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div>
                            <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80 -ml-3"></div>
                            </div>
                        </div>

                        <div className="bg-white border border-khaki-200 rounded-lg p-4 flex items-center justify-between">
                            <span className="text-gray-600 tracking-wider">**** 4523</span>
                            <div className="flex gap-[-4px]">
                            <div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div>
                            <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80 -ml-3"></div>
                            </div>
                        </div>

                        <button className="w-full text-left p-4 text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors">
                            <Plus className="w-4 h-4" />
                            Add card
                        </button>
                        </div>
                    </div>
                </div>

                <hr className='mt-6' />

                <PaymentHistory />
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
