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
    router.replace("/panel/settings/manage-account");
  }, [router]);

  return (
    <PanelLayout>
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </PanelLayout>
  );
}
