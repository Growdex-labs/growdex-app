"use client";

import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { DashboardHeader } from "../../components/dashboard-header";

export default function SupportAndHelpSettingsPage() {
  const supportOptions = [
    {
      id: "help-center",
      title: "Help Center",
      description:
        "Explore FAQs, campaign setup guides, and troubleshooting resources.",
      emoji: "🔒",
      buttonText: "Visit Help Center",
      buttonHref: "#",
    },
    {
      id: "chat-support",
      title: "Chat & Ticket Support",
      description:
        "Get personalized support or submit a tickets directly to our team.",
      emoji: "🔒",
      buttonText: "Contact Support",
      buttonHref: "#",
    },
    {
      id: "feedback",
      title: "Feedback",
      description: "Share ideas or report issues to help us improve Growdex.",
      emoji: "🔒",
      buttonText: "Give Feedback",
      buttonHref: "#",
    },
  ];

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
            {/* Support & Help Content */}

            {/* Yellow Header Section */}
            <div className="bg-khaki-200 rounded-lg px-4 mb-6 md:px-6 py-3">
              <h1 className="text-2xl md:text-2xl text-center font-bold text-slate-700">
                Support & Help
              </h1>
            </div>
            <div className="bg-white rounded-lg shadow-sm">
              {/* Support Options Grid */}
              <div className="p-4 md:p-6">
                <div className="my-6 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center w-full p-1 rounded-lg bg-khaki-200/40">
                    <button className="w-full h-full rounded-lg p-1 justify-center  flex gap-2 items-center">
                      <span className="text-sm">Platform</span>
                    </button>
                    <button className="w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center">
                      <span className="text-sm">Status</span>
                    </button>
                    <button className="w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center">
                      <span className="text-sm">Action</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {supportOptions.map((option) => {
                    return (
                      <div
                        key={option.id}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 md:p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl hover:border-yellow-400"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 text-3xl md:text-4xl">
                            {option.emoji}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                              {option.title}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        <a
                          href={option.buttonHref}
                          className="flex-shrink-0 inline-block px-4 md:px-6 py-2 md:py-2.5 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors text-sm md:text-base"
                        >
                          {option.buttonText}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
