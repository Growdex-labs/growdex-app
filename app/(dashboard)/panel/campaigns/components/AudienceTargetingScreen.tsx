"use client";

import { useEffect, useState } from "react";
import {
  forecastCampaignReach,
  type CampaignConfiguration,
  type CampaignGoal,
  type CampaignPlatform,
  type CreateCampaignPayload,
  type MetaInterest,
} from "@/lib/campaigns";
import type { SocialAccountSetupProps } from "@/types/social";
import { AudienceReachCard } from "./AudienceReachCard";
import type { AudienceAiFixRequest } from "./AudienceReachCard";
import { DemographicsForm } from "./DemographicsForm";

type Audience = CreateCampaignPayload["audience"];

interface AudienceTargetingScreenProps {
  goal: CampaignGoal;
  platforms: CampaignPlatform[];
  configuration: CampaignConfiguration;
  audience: Audience;
  accounts: SocialAccountSetupProps | null;
  unavailableInterests: Record<string, MetaInterest[]>;
  onChange: (next: Partial<Audience>) => void;
  onReplaceInterest: (unavailable: string, replacement: string) => void;
  onClearUnavailableInterests: () => void;
  onFixAllWithAi?: (
    request: AudienceAiFixRequest,
  ) => Promise<void>;
}

export function AudienceTargetingScreen({
  goal,
  platforms,
  configuration,
  audience,
  accounts,
  unavailableInterests,
  onChange,
  onReplaceInterest,
  onClearUnavailableInterests,
  onFixAllWithAi,
}: AudienceTargetingScreenProps) {
  const [forecast, setForecast] = useState<Awaited<
    ReturnType<typeof forecastCampaignReach>
  > | null>(null);
  const [forecasting, setForecasting] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const metaSelected = platforms.includes("meta");
  const metaConnected = Boolean(
    accounts?.meta?.connected && !accounts.meta.needsReauth,
  );
  const metaAssetId = configuration.accountAssetIds?.meta;
  const canForecast = Boolean(
    metaSelected && metaConnected && metaAssetId && audience.locations.length,
  );

  useEffect(() => {
    if (!canForecast || !metaAssetId) {
      return;
    }
    let active = true;
    const timeout = window.setTimeout(() => {
      setForecasting(true);
      setForecastError(null);
      void forecastCampaignReach({
        goal,
        accountAssetId: metaAssetId,
        audience,
      })
        .then((result) => {
          if (active) setForecast(result);
        })
        .catch((failure) => {
          if (!active) return;
          setForecast(null);
          setForecastError(
            failure instanceof Error
              ? failure.message
              : "Could not forecast this audience.",
          );
        })
        .finally(() => {
          if (active) setForecasting(false);
        });
    }, 500);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [audience, canForecast, goal, metaAssetId]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-gray-900">
        Find the people you want to reach
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Every choice below is saved with the campaign and sent to the selected
        ad accounts.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <DemographicsForm
            platforms={platforms}
            accountAssetIds={configuration.accountAssetIds ?? {}}
            audience={audience}
            unavailableInterests={unavailableInterests}
            onChange={onChange}
            onReplaceInterest={onReplaceInterest}
            onClearUnavailableInterests={onClearUnavailableInterests}
          />
        </div>

        <AudienceReachCard
          audience={audience}
          forecast={canForecast ? forecast : null}
          loading={canForecast && forecasting}
          error={canForecast ? forecastError : null}
          metaSelected={metaSelected}
          metaConnected={metaConnected}
          unavailableInterestCount={Object.keys(unavailableInterests).length}
          onFixAllWithAi={onFixAllWithAi}
        />
      </div>
    </section>
  );
}

export default AudienceTargetingScreen;
