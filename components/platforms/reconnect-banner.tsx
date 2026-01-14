import { API_BASE_URL } from "@/lib/auth";

export function ReconnectBanner({
  platform,
  reconnectUrl
}: {
  platform: string;
  reconnectUrl: string;
}) {
  return (
    <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-6">
      <p className="text-sm text-yellow-800">
        Your access to {platform} has expired.
      </p>
      <a
        href={API_BASE_URL+reconnectUrl}
        className="inline-block mt-2 text-sm font-medium text-blue-600"
      >
        Reconnect {platform}
      </a>
    </div>
  );
}
