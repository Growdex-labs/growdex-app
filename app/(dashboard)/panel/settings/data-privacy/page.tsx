import React from "react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { DashboardHeader } from "../../components/dashboard-header";
import { SettingsHeader } from "../components/settings-header";
import { PrivacyPolicyClient } from "./privacy-policy-client";

export default function DataPrivacyPage() {
  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <div className="hidden md:block border-r border-gray-200">
          <SettingsSidebar />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <SettingsHeader />

          <div className="p-4 md:p-6 flex flex-col flex-1 min-h-0">
            {/* <div className="hidden md:block mb-6">
              <DashboardHeader />
            </div> */}

            {/* Header Title */}
            <div className="bg-[#fde047] py-2 w-full mb-4 max-w-5xl mx-auto rounded-lg shadow-sm shrink-0">
              <h1 className="text-center font-gilroy-bold text-gray-900 font-semibold text-lg">
                Privacy Policy
              </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm w-full max-w-5xl mx-auto pt-8 flex flex-col flex-1 min-h-0 border border-gray-100 overflow-hidden">

              {/* Intro text */}
              <div className="max-w-3xl mx-auto text-center mb-8 px-4 shrink-0">
                <p className="text-gray-900 text-sm md:text-base font-medium">
                  Growdex provides an AI-powered advertising platform and marketing services
                  that help businesses create, launch, manage, and optimize digital advertising
                  campaigns across multiple platforms.
                </p>
              </div>

              {/* Main Content Areas with Scroll Spy Sidebar */}
              <div className="flex-1 min-h-0">
                <PrivacyPolicyClient />
              </div>

            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
