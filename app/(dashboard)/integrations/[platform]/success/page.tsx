"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { hydrateSocialAccounts } from "@/lib/social";

type Status = "loading" | "success" | "error";

export default function IntegrationSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const platform =
    Array.isArray(params?.platform)
      ? params.platform[0]
      : params?.platform ?? "";

  const source = searchParams.get("source");
  const platformName =
    platform.charAt(0).toUpperCase() + platform.slice(1);

  const [status, setStatus] = useState<Status>("loading");
  const [needsReauth, setNeedsReauth] = useState(false);

  useEffect(() => {
    hydrateSocialAccounts().then((res) => {
      if (!res.success || !res.data) {
        setStatus("error");
        return;
      }

      const platformState = res.data[platform as "meta" | "tiktok"];

      if (!platformState?.connected) {
        setStatus("error");
        return;
      }

      setNeedsReauth(platformState.needsReauth!);
      setStatus("success");
    });
  }, [platform]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking connection…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold mb-2">
            {platformName} connection not confirmed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn’t verify your {platformName} connection. Please try
            reconnecting.
          </p>
          <a
            href="/settings/integrations"
            className="inline-flex rounded-md bg-black px-4 py-2 text-white text-sm"
          >
            Go to integrations
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {needsReauth
            ? `${platformName} reconnected`
            : `${platformName} connected`}
        </h1>

        <p className="text-gray-600 mb-6">
          {source === "email" && (
            <>Your {platformName} account has been restored successfully.</>
          )}
          {source === "reconnect" && (
            <>Your {platformName} permissions have been refreshed.</>
          )}
          {!source && (
            <>
              Your {platformName} account is now connected and ready to use.
            </>
          )}
        </p>

        <div className="flex justify-center gap-3">
          <a
            href="/panel"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Go to dashboard
          </a>
          <a
            href="/settings/integrations"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Manage integrations
          </a>
        </div>
      </div>
    </main>
  );
}
