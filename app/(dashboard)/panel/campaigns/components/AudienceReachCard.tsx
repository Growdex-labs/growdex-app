"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type {
  AudienceStrategy,
  AudienceReachForecast,
} from "@/lib/campaigns";
import { CampaignSkeleton } from "./CampaignSkeleton";

type Audience = AudienceStrategy["audience"];

export type AudienceReadinessIssueCode =
  | "missing-location"
  | "invalid-age-range"
  | "missing-devices"
  | "conflicting-saved-audience"
  | "unavailable-interests"
  | "audience-too-narrow";

export interface AudienceReadinessIssue {
  code: AudienceReadinessIssueCode;
  title: string;
  description: string;
  severity: "blocking" | "warning";
  scoreImpact: number;
}

export interface AudienceReadiness {
  score: number;
  status: "ready" | "attention" | "blocked";
  label: string;
  issues: AudienceReadinessIssue[];
}

export interface AudienceAiFixRequest {
  audience: Audience;
  forecast: AudienceReachForecast | null;
  issues: AudienceReadinessIssue[];
}

interface AudienceReachCardProps {
  audience: Audience;
  forecast: AudienceReachForecast | null;
  loading: boolean;
  error: string | null;
  metaSelected: boolean;
  metaConnected: boolean;
  unavailableInterestCount?: number;
  onFixAllWithAi?: (
    request: AudienceAiFixRequest,
  ) => Promise<void>;
}

const formatAudience = (value: number) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const uniqueOverlap = (left: string[] = [], right: string[] = []) => {
  const rightSet = new Set(right);
  return [...new Set(left.filter((value) => rightSet.has(value)))];
};

export function getAudienceReadiness(
  audience: Audience,
  forecast: AudienceReachForecast | null,
  unavailableInterestCount = 0,
): AudienceReadiness {
  const issues: AudienceReadinessIssue[] = [];
  const ageMin = audience.ageMin ?? 18;
  const ageMax = audience.ageMax ?? 65;

  if (!audience.locations.length) {
    issues.push({
      code: "missing-location",
      title: "Add an audience location",
      description:
        "Choose at least one country before Meta can estimate or publish this audience.",
      severity: "blocking",
      scoreImpact: 40,
    });
  }

  if (ageMin < 18 || ageMax > 65 || ageMin > ageMax) {
    issues.push({
      code: "invalid-age-range",
      title: "Correct the age range",
      description: "Use an age range between 18 and 65, with the minimum below the maximum.",
      severity: "blocking",
      scoreImpact: 30,
    });
  }

  if (!(audience.devices ?? []).length) {
    issues.push({
      code: "missing-devices",
      title: "Choose at least one device",
      description: "Select mobile, desktop, or both so delivery has an eligible device.",
      severity: "blocking",
      scoreImpact: 20,
    });
  }

  const conflictingAudienceIds = uniqueOverlap(
    audience.includeAudienceIds,
    audience.excludeAudienceIds,
  );
  if (conflictingAudienceIds.length) {
    issues.push({
      code: "conflicting-saved-audience",
      title: "Resolve saved audience conflicts",
      description: `${conflictingAudienceIds.length} saved audience${conflictingAudienceIds.length === 1 ? " is" : "s are"} both included and excluded.`,
      severity: "blocking",
      scoreImpact: 25,
    });
  }

  if (unavailableInterestCount > 0) {
    issues.push({
      code: "unavailable-interests",
      title: "Replace unavailable interests",
      description: `${unavailableInterestCount} interest${unavailableInterestCount === 1 ? " is" : "s are"} unavailable for the selected Meta account.`,
      severity: "blocking",
      scoreImpact: 25,
    });
  }

  if (forecast && !forecast.ready) {
    issues.push({
      code: "audience-too-narrow",
      title: "Audience is too narrow",
      description:
        "Meta could not produce a stable reach estimate. Broaden the targeting before publishing.",
      severity: "warning",
      scoreImpact: 25,
    });
  }

  const score = Math.max(
    0,
    100 - issues.reduce((total, issue) => total + issue.scoreImpact, 0),
  );
  const blocked = issues.some((issue) => issue.severity === "blocking");

  return {
    score,
    status: blocked ? "blocked" : issues.length ? "attention" : "ready",
    label: blocked ? "Not ready" : issues.length ? "Needs attention" : "Ready",
    issues,
  };
}

function ReadinessRing({ score }: { score: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-24 shrink-0" aria-label={`Audience readiness ${score}%`}>
      <svg className="size-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#ede9fe"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#a855f7"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-gilroy-bold text-gray-900">
        {score}%
      </span>
    </div>
  );
}

export function AudienceReachCard({
  audience,
  forecast,
  loading,
  error,
  metaSelected,
  metaConnected,
  unavailableInterestCount = 0,
  onFixAllWithAi,
}: AudienceReachCardProps) {
  const [fixing, setFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const readiness = getAudienceReadiness(
    audience,
    forecast,
    unavailableInterestCount,
  );
  const reach = forecast
    ? forecast.lower
      ? `${formatAudience(forecast.lower)}–${formatAudience(forecast.upper)}`
      : `Up to ${formatAudience(forecast.upper)}`
    : null;

  const handleFixAll = async () => {
    if (!onFixAllWithAi || !readiness.issues.length) return;
    setFixing(true);
    setFixError(null);
    try {
      await onFixAllWithAi({
        audience,
        forecast,
        issues: readiness.issues,
      });
    } catch (failure) {
      setFixError(
        failure instanceof Error
          ? failure.message
          : "Growdex AI could not fix this audience.",
      );
    } finally {
      setFixing(false);
    }
  };

  return (
    <aside className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-gilroy-semibold text-violet-600">
        <Sparkles className="h-3.5 w-3.5" /> Audience health
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ReadinessRing score={readiness.score} />
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Audience readiness</p>
          <p className="mt-1 text-lg font-gilroy-bold text-gray-900">
            {readiness.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {readiness.issues.length
              ? `${readiness.issues.length} audience issue${readiness.issues.length === 1 ? "" : "s"} to review`
              : "This audience is ready for delivery."}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-gilroy-semibold text-violet-600">
          Live audience forecast
        </p>
        {loading ? (
          <CampaignSkeleton className="mt-3 w-full" />
        ) : reach ? (
          <>
            <p className="mt-3 text-xs text-gray-500">Potential Meta audience</p>
            <p className="mt-1 text-2xl font-gilroy-bold text-gray-900">{reach}</p>
            <div
              className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${
                forecast?.ready
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {forecast?.ready ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p>
                {forecast?.ready
                  ? "This live estimate comes from the connected Meta ad account."
                  : "Audience is too narrow for Meta to produce a stable estimate."}
              </p>
            </div>
          </>
        ) : (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs leading-5 text-gray-700">
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
      </div>

      {readiness.issues.length > 0 ? (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-gilroy-semibold text-gray-900">
              Detected issues
            </p>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] text-violet-700">
              {readiness.issues.length} found
            </span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {readiness.issues.map((issue) => (
              <li
                key={issue.code}
                className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <TriangleAlert
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    issue.severity === "blocking"
                      ? "text-red-500"
                      : "text-amber-500"
                  }`}
                />
                <div>
                  <p className="text-xs font-gilroy-semibold text-gray-900">
                    {issue.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-gray-500">
                    {issue.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleFixAll}
            disabled={fixing || !onFixAllWithAi}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-gilroy-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {fixing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {fixing ? "Improving audience…" : "Fix all with AI"}
          </button>
          {!onFixAllWithAi && (
            <p className="mt-2 text-center text-[11px] text-gray-500">
              Available in AI-assisted campaigns.
            </p>
          )}
          {fixError && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
            >
              {fixError}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>No audience issues detected.</p>
        </div>
      )}
    </aside>
  );
}

export default AudienceReachCard;
