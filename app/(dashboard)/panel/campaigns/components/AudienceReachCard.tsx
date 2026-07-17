"use client";

import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { AudienceReachForecast } from "@/lib/campaigns";
import { CampaignSkeleton } from "./CampaignSkeleton";

interface AudienceReachCardProps {
  forecast: AudienceReachForecast | null;
  loading: boolean;
  error: string | null;
  metaSelected: boolean;
  metaConnected: boolean;
}

const formatAudience = (value: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);

export function AudienceReachCard({
  forecast,
  loading,
  error,
  metaSelected,
  metaConnected,
}: AudienceReachCardProps) {
  const reach = forecast
    ? forecast.lower
      ? `${formatAudience(forecast.lower)}–${formatAudience(forecast.upper)}`
      : `Up to ${formatAudience(forecast.upper)}`
    : null;

  return (
    <aside className="rounded-2xl border border-amber-200 bg-dimYellow/30 p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-violet-600">
        <Sparkles className="h-3.5 w-3.5" /> Live audience forecast
      </div>
      {loading ? (
        <CampaignSkeleton className="mt-4 w-full" />
      ) : reach ? (
        <>
          <p className="mt-4 text-xs text-gray-500">Potential Meta audience</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{reach}</p>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>This estimate comes from the connected Meta ad account and updates with the audience choices.</p>
          </div>
        </>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs text-gray-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
          <p>
            {error ??
              (!metaSelected
                ? "Add Meta to this campaign to get a live audience forecast."
                : !metaConnected
                  ? "Connect a Meta ad account to get a live audience forecast."
                  : "Choose an audience to get a live forecast.")}
          </p>
        </div>
      )}
    </aside>
  );
}

export default AudienceReachCard;
