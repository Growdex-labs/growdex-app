'use client';

import { Plus } from 'lucide-react';
import { PanelLayout } from '../../components/panel-layout';
import { WalletSidebar } from '../components/wallet-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import AllBudgetList from './components/all-budget-list';

export default function BudgetPage() {

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar */}
        <WalletSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* budget header */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 items-center">
                <div className='w-full'>
                    <small>Wallet {'>>'} Budget</small>
                    <h2 className="text-lg font-semibold">Set Campaign Budgets</h2>
                </div>

                <p>
                    A test campaign is a small-scale, controlled marketing initiative designed to evaluate how an audience responds to specific messaging, creatives, channels, or offers before a full-scale rollout.
                </p>
            </div>

            {/* budget tabs */}
            <div className="mt-4">
                <Tabs defaultValue='all'>
                    <TabsList className='h-14 grid grid-cols-5 gap-2 w-full bg-white'>
                        <TabsTrigger value="all" className='col-span-2 h-10 bg-gray-200 data-[state=active]:bg-khaki-200'>All Budgets</TabsTrigger>
                        <TabsTrigger value="suspended" className='col-span-2 h-10 bg-gray-200 data-[state=active]:bg-khaki-200'>Suspended Budgets</TabsTrigger>
                        <Link href="/dashboard/panel/wallet/budget/create" className='col-span-1 h-10 text-gray-300 flex items-center justify-center'><Plus className="mr-2 h-4 w-4 text-khaki-200" /> Create Budget</Link>
                    </TabsList>

                    {/* budget tabs content */}
                    <TabsContent value="all">
                        <AllBudgetList />
                        <div className="mt-6 w-fit">
                            <Link href="/panel/wallet/budget/create" className='flex items-center gap-2 border border-black px-4 py-2 rounded-lg'>
                                <Plus />
                                Create budget
                            </Link>
                        </div>
                    </TabsContent>
                    <TabsContent value="suspended">
                        <p>Content for Budgets</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </div>
    </PanelLayout>
  );
}
