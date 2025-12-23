"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLayout } from "../components/panel-layout";
import { SettingsSidebar } from "../components/settings-sidebar";
import { DashboardHeader } from "../components/dashboard-header";
import { SettingsHeader } from "./components/settings-header";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/panel/settings/manage-permissions");
  }, [router]);

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar - Desktop Only */}
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Header */}
          <SettingsHeader />

          <div className="p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden md:block mb-6">
              <DashboardHeader />
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Settings
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Manage your account settings, permissions, and security
                  preferences.
                </p>
              </div>

              {/* Settings Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Manage Account Card */}
                <a
                  href="/panel/settings/manage-account"
                  className="block p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-khaki-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-khaki-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Manage Account
                  </h3>
                  <p className="text-sm text-gray-600">
                    Update your profile information, email, and personal
                    details.
                  </p>
                </a>

                {/* Manage Permissions Card */}
                <a
                  href="/panel/settings/manage-permissions"
                  className="block p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-khaki-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-khaki-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Manage Permissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Control access levels and permissions for team members.
                  </p>
                </a>

                {/* Security Control Card */}
                <a
                  href="/panel/settings/security-control"
                  className="block p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-khaki-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-khaki-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Security Control
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage passwords, two-factor authentication, and security
                    settings.
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
