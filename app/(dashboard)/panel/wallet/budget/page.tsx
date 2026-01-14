"use client";

import { Plus } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { WalletSidebar } from "../components/wallet-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import Link from "next/link";
import AllBudgetList from "./components/all-budget-list";
import { WalletHeader } from "../components/wallet-header";
import CreateBudget from "./components/create-budget";
import SuspendedBudget from "./components/suspended-budget";

export default function BudgetPage() {
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
          {/* budget header */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full">
              <small>Wallet {">>"} Budget</small>
              <h2 className="text-lg font-semibold">Set Campaign Budgets</h2>
            </div>

            <p>
              A test campaign is a small-scale, controlled marketing initiative
              designed to evaluate how an audience responds to specific
              messaging, creatives, channels, or offers before a full-scale
              rollout.
            </p>
          </div>

          {/* budget tabs */}
          <div className="mt-4">
            <Tabs defaultValue="all">
              <TabsList className="h-auto md:h-14 grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-2 w-full bg-white p-1.5 md:p-2">
                <TabsTrigger
                  value="all"
                  className="col-span-1 md:col-span-2 h-9 md:h-10 bg-gray-200 data-[state=active]:bg-khaki-200 text-xs md:text-sm px-2 md:px-3"
                >
                  <span className="hidden sm:inline">All Budgets</span>
                  <span className="sm:hidden">All</span>
                </TabsTrigger>
                <TabsTrigger
                  value="suspended"
                  className="col-span-1 md:col-span-2 h-9 md:h-10 bg-gray-200 data-[state=active]:bg-khaki-200 text-xs md:text-sm px-2 md:px-3"
                >
                  <span className="hidden sm:inline">Suspended Budgets</span>
                  <span className="sm:hidden">Suspended</span>
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="col-span-1 h-9 md:h-10 text-gray-700 bg-gray-200 data-[state=active]:bg-khaki-200 flex items-center justify-center text-xs md:text-sm px-2 md:px-3"
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 text-gray-700 md:mr-2" />
                  <span className="hidden md:inline">Create Budget</span>
                  <span className="md:hidden ml-1">Create</span>
                </TabsTrigger>
              </TabsList>

              {/* budget tabs content */}
              <TabsContent value="all">
                <AllBudgetList />
              </TabsContent>

              <TabsContent value="suspended">
                <SuspendedBudget />
              </TabsContent>

              <TabsContent value="create">
                <CreateBudget />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
