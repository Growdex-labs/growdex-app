"use client";

import { type JSX } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { DashboardHeader } from "../../components/dashboard-header";

export default function DataAndPrivacyPage(): JSX.Element {
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

            {/* Data & Privacy Content */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Yellow Header Section */}
              <div className="bg-yellow-300 rounded-t-lg px-4 md:px-6 py-4 md:py-5">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Privacy Policy
                </h1>
              </div>

              {/* Content Section */}
              <div className="p-4 md:p-6">
                <div className="mb-8 text-sm md:text-base text-gray-700">
                  <p>
                    Growdex provides an AI-powered advertising platform and
                    marketing services that help businesses create, launch,
                    manage, and optimize digital advertising campaigns across
                    multiple platforms.
                  </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-orange-600 mb-6">
                      Information We Collect
                    </h2>
                    <div className="space-y-3">
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        How We Use Your Information
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Information You Provide
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Data Security
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Data Retention
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Your Rights
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Children's Privacy
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        International Data Transfers
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Third-Party Links
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Updates to This Privacy Policy
                      </div>
                      <div className="text-sm md:text-base font-medium text-gray-900">
                        Contact Us
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-orange-600 mb-6">
                      Information We Collect
                    </h2>
                    <div className="space-y-6">
                      {/* Section 1.1 */}
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
                          1.1 Information You Provide
                        </h3>
                        <ul className="space-y-2">
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              Account Information: Name, email address, phone
                              number, business name, password, and billing
                              information.
                            </span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              Billing Information: Payment details when funding
                              your Growdex wallet or paying for services.
                            </span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              Business Information: Ad account IDs, social media
                              handles, business category, marketing goals.
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* Section 1.2 */}
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
                          1.2 Information Collected Automatically
                        </h3>
                        <ul className="space-y-2">
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              Device information: Device type, browser type, IP
                              address.
                            </span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              Usage logs: Pages visited, sections performed on
                              the platform.
                            </span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              Cookies and tracking technologies: Store user
                              preferences and performance monitoring.
                            </span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              System diagnostics: For performance and security
                              monitoring.
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* Section 1.3 */}
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
                          1.3 Third-Party Platform Data
                        </h3>
                        <ul className="space-y-2">
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              This data is collected only with explicit user
                              consent.
                            </span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>Ad performance metrics.</span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>Audience insights.</span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>Creative assets.</span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>Spend and billing data.</span>
                          </li>
                          <li className="text-xs md:text-sm text-gray-700 flex items-start">
                            <span className="mr-3 text-gray-400">•</span>
                            <span>
                              OAuth access tokens (securely stored and
                              encrypted).
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Information Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-lg md:text-xl font-bold text-orange-600 mb-6">
                    How We Use Your Information
                  </h2>

                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
                      2.1 Provide and Improve Our Services
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-xs md:text-sm text-gray-700 flex items-start">
                        <span className="mr-3 text-gray-400">•</span>
                        <span>We use your information to:</span>
                      </li>
                      <li className="text-xs md:text-sm text-gray-700 flex items-start">
                        <span className="mr-3 text-gray-400">•</span>
                        <span>
                          Enable ad creation, publishing, and campaign
                          management.
                        </span>
                      </li>
                      <li className="text-xs md:text-sm text-gray-700 flex items-start">
                        <span className="mr-3 text-gray-400">•</span>
                        <span>Provide analytics and reporting.</span>
                      </li>
                      <li className="text-xs md:text-sm text-gray-700 flex items-start">
                        <span className="mr-3 text-gray-400">•</span>
                        <span>
                          Improve platform features and user experience.
                        </span>
                      </li>
                      <li className="text-xs md:text-sm text-gray-700 flex items-start">
                        <span className="mr-3 text-gray-400">•</span>
                        <span>Detect and prevent fraud.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
