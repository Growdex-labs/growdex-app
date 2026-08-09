"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLayout } from "../components/panel-layout";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/panel/settings/profile");
  }, [router]);

  return (
    <PanelLayout>
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    </PanelLayout>
  );
}
