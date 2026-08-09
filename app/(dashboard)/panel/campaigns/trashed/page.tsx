"use client";

import { Trash2 } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../../components/campaigns-mobile-header";

export default function TrashedCampaignsPage() {
  return (
    <PanelLayout>
      <div className="flex min-h-full">
        <div className="hidden md:block">
          <CampaignsSidebar />
        </div>

        <div className="flex flex-1 flex-col overflow-auto">
          <CampaignsMobileHeader />

          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
              <header className="mb-6">
                <h1 className="text-2xl font-gilroy-bold text-gray-950">
                  Trash
                </h1>
                <p className="mt-1 text-sm leading-6 text-dimGray">
                  Campaigns you remove will be held here before they are gone
                  for good.
                </p>
              </header>

              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <Trash2 className="mx-auto size-10 text-gray-300" strokeWidth={1.5} />
                <h2 className="mt-5 text-lg font-gilroy-semibold text-gray-900">
                  Trash isn&apos;t available yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-dimGray">
                  Removing a campaign deletes it straight away today. When
                  recoverable deletion is connected, removed campaigns will
                  appear here first.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PanelLayout>
  );
}
