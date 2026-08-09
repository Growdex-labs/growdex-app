"use client";

import type { ComponentType } from "react";
import { BookOpen, Lightbulb, MessageCircle } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";

interface SupportOption {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  actionLabel: string;
  href: string;
  external: boolean;
}

const SUPPORT_OPTIONS: SupportOption[] = [
  {
    id: "help-center",
    title: "Help Center",
    description:
      "Explore FAQs, campaign setup guides, and troubleshooting resources.",
    Icon: BookOpen,
    actionLabel: "Visit Help Center",
    href: "https://growdex.ai/help-center",
    external: true,
  },
  {
    id: "chat-support",
    title: "Chat & Ticket Support",
    description:
      "Get personalised support or send a ticket straight to our team.",
    Icon: MessageCircle,
    actionLabel: "Contact Support",
    href: "mailto:support@growdex.ai?subject=Growdex%20support%20request",
    external: false,
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Share ideas or report issues to help us improve Growdex.",
    Icon: Lightbulb,
    actionLabel: "Give Feedback",
    href: "mailto:feedback@growdex.ai?subject=Growdex%20product%20feedback",
    external: false,
  },
];

export default function SupportAndHelpSettingsPage() {
  return (
    <PanelLayout>
      <div className="flex h-full overflow-hidden bg-gray-50">
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        <div className="flex-1 overflow-auto">
          <SettingsHeader />

          <div className="p-4 md:p-6">
            <header className="mb-6">
              <h1 className="text-2xl font-gilroy-bold text-gray-950">
                Support &amp; Help
              </h1>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Find an answer yourself, or reach the Growdex team directly.
              </p>
            </header>

            <ul className="space-y-3">
              {SUPPORT_OPTIONS.map(
                ({ id, title, description, Icon, actionLabel, href, external }) => (
                  <li
                    key={id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-6"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                        <Icon className="size-5 text-gray-500" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-gilroy-semibold text-gray-950">
                          {title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {description}
                        </p>
                      </div>
                    </div>

                    <a
                      href={href}
                      {...(external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                      className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-gilroy-semibold text-gray-800 transition-colors hover:bg-gray-50"
                    >
                      {actionLabel}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
