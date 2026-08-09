import { PanelLayout } from "../../components/panel-layout";
import { BillingSidebar } from "../components/billing-sidebar";
import { BillingHeader } from "../components/billing-header";

export default function BudgetPage() {
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
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-gilroy-semibold text-gray-900">
              Campaign budgets aren&apos;t available yet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Budget controls will appear here after they are connected to live
              campaign and funding data.
            </p>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
