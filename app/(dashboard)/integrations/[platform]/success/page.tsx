"use client";
import { CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function IntegrationSuccessPage() {
  const params = useParams();
  const platform =
    Array.isArray(params?.platform) ? params.platform[0] : params?.platform ?? '';
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {platformName} Connected Successfully
        </h1>

        <p className="text-gray-600 mb-6">
          Your {platformName} account has been successfully connected to
          Growdex. You can now create, manage, and analyze your ad campaigns
          directly from the dashboard.
        </p>

        <a
          href="/panel"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition"
        >
          Go to dashboard
        </a>
      </div>
    </main>
  );
}
