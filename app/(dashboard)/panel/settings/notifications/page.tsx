"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { Switch } from "@/components/ui/switch";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notification-preferences";

const OPTIONS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "campaignUpdates",
    label: "Campaign updates",
    description: "When a campaign is published, paused, or changes state.",
  },
  {
    key: "performanceAlerts",
    label: "Performance alerts",
    description: "When a campaign needs your attention.",
  },
  {
    key: "aiRecommendations",
    label: "AI recommendations",
    description: "When Growdex AI has a suggestion for your campaigns.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "New Growdex features and improvements.",
  },
];

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<
    keyof NotificationPreferences | null
  >(null);

  useEffect(() => {
    let active = true;
    void fetchNotificationPreferences()
      .then((result) => {
        if (active) setPreferences(result);
      })
      .catch((failure) => {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load your notification settings.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = async (key: keyof NotificationPreferences, next: boolean) => {
    if (!preferences) return;
    const previous = preferences;
    const updated = { ...preferences, [key]: next };
    setPreferences(updated);
    setSavingKey(key);

    try {
      await updateNotificationPreferences(updated);
    } catch (failure) {
      setPreferences(previous);
      toast.error(
        failure instanceof Error
          ? failure.message
          : "Your notification settings could not be saved.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <PanelLayout>
      <div className="flex h-full overflow-hidden bg-gray-50">
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        <div className="flex-1 overflow-auto">
          <SettingsHeader />

          <div className="p-4 md:p-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
              <h2 className="font-gilroy-semibold text-gray-950">
                Notifications
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Choose how you&apos;d like Growdex to keep you updated.
              </p>

              <h3 className="mt-6 text-sm font-gilroy-semibold text-gray-900">
                Email notifications
              </h3>

              {error ? (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : !preferences ? (
                <div className="mt-4 flex min-h-40 items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100">
                  {OPTIONS.map((option) => (
                    <li
                      key={option.key}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-gilroy-semibold text-gray-900">
                          {option.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-gray-500">
                          {option.description}
                        </p>
                      </div>
                      <Switch
                        checked={preferences[option.key]}
                        disabled={savingKey === option.key}
                        onCheckedChange={(next) =>
                          void toggle(option.key, next)
                        }
                        aria-label={option.label}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
