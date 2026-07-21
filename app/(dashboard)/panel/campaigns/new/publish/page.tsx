"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PanelLayout } from "../../../components/panel-layout";
import DottedBackground from "@/components/dotted-background";
import { useMe } from "@/context/me-context";
import {
  campaignDtoToPayload,
  fetchCampaignById,
  publishCampaign,
  updateCampaignDraft,
  type CampaignReviewPayload,
} from "@/lib/campaigns";
import { hydrateSocialAccounts } from "@/lib/social";
import type { SocialAccountSetupProps } from "@/types/social";
import { CampaignTreeSidebar } from "../../components/CampaignTreeSidebar";
import { ReviewPublishScreen } from "../../components/ReviewPublishScreen";

export default function PublishCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const { me } = useMe();
  const [campaign, setCampaign] = useState<CampaignReviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<SocialAccountSetupProps | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void hydrateSocialAccounts()
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setAccounts(result.data ?? {});
          return;
        }
        setAccountsError(result.error ?? "Could not load connected accounts.");
      })
      .finally(() => {
        if (active) setAccountsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!campaignId) {
      router.replace("/panel/campaigns/new");
      return;
    }

    let active = true;
    void fetchCampaignById(campaignId)
      .then((result) => {
        if (!active) return;
        if (result.status && !["draft", "failed"].includes(result.status)) {
          throw new Error(
            "Only draft or failed campaigns can be published from this screen.",
          );
        }
        setSourceStatus(result.status ?? "draft");
        const payload = campaignDtoToPayload(result);
        setCampaign(payload);
        setActiveStrategyId(payload.audienceStrategies[0]?.id ?? null);
      })
      .catch((failure) => {
        if (!active) return;
        setError(
          failure instanceof Error ? failure.message : "Could not load the campaign.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [campaignId, router]);

  const handlePublish = async () => {
    if (!campaignId) return;
    setIsPublishing(true);
    setError(null);
    try {
      await publishCampaign(campaignId);
      router.push("/panel/campaigns");
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not publish the campaign.",
      );
      setIsPublishing(false);
    }
  };

  const handleDuplicateStrategy = async (strategyId: string) => {
    if (!campaignId || !campaign || sourceStatus !== "draft") return;
    const creationMode = campaign.creationMode;
    if (creationMode === "unknown") {
      setError("This draft does not have a supported setup mode.");
      return;
    }
    const source = campaign.audienceStrategies.find(
      (strategy) => strategy.id === strategyId,
    );
    if (!source) return;

    const duplicate = {
      ...structuredClone(source),
      id: crypto.randomUUID(),
      name: `Copy of ${source.name || "Audience Strategy"}`,
    };
    const sourceIndex = campaign.audienceStrategies.findIndex(
      (strategy) => strategy.id === strategyId,
    );
    const nextCampaign = {
      ...campaign,
      creationMode,
      audienceStrategies: campaign.audienceStrategies.toSpliced(
        sourceIndex + 1,
        0,
        duplicate,
      ),
    };

    setError(null);
    setCampaign(nextCampaign);
    setActiveStrategyId(duplicate.id);
    try {
      const savedCampaign = await updateCampaignDraft(campaignId, nextCampaign);
      setCampaign(campaignDtoToPayload(savedCampaign));
      router.push(
        `/panel/campaigns/new?id=${encodeURIComponent(campaignId)}&strategy=${encodeURIComponent(duplicate.id)}`,
      );
    } catch (failure) {
      setCampaign(campaign);
      setActiveStrategyId(strategyId);
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not duplicate the audience strategy.",
      );
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (
      !campaignId ||
      !campaign ||
      sourceStatus !== "draft" ||
      campaign.audienceStrategies.length === 1
    ) {
      return;
    }
    if (campaign.creationMode === "unknown") {
      setError("This draft does not have a supported setup mode.");
      return;
    }

    const nextCampaign = {
      ...campaign,
      creationMode: campaign.creationMode,
      audienceStrategies: campaign.audienceStrategies.filter(
        (strategy) => strategy.id !== strategyId,
      ),
    };
    const previousActiveStrategyId = activeStrategyId;
    const nextActiveStrategyId =
      activeStrategyId === strategyId
        ? nextCampaign.audienceStrategies[0]?.id ?? null
        : activeStrategyId;

    setError(null);
    setCampaign(nextCampaign);
    setActiveStrategyId(nextActiveStrategyId);
    try {
      const savedCampaign = await updateCampaignDraft(campaignId, nextCampaign);
      setCampaign(campaignDtoToPayload(savedCampaign));
    } catch (failure) {
      setCampaign(campaign);
      setActiveStrategyId(previousActiveStrategyId);
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not delete the audience strategy.",
      );
    }
  };

  return (
    <PanelLayout>
      <div className="relative flex h-full">
        <DottedBackground fade />
        <div className="relative z-10 flex h-full w-full">
          <CampaignTreeSidebar
            campaignName={campaign?.campaign.name ?? "Campaign review"}
            campaign={campaign ?? undefined}
            activeStrategyId={activeStrategyId}
            onSelectStrategy={setActiveStrategyId}
            onDuplicateStrategy={
              sourceStatus === "draft"
                ? (strategyId) => void handleDuplicateStrategy(strategyId)
                : undefined
            }
            onDeleteStrategy={
              sourceStatus === "draft"
                ? (strategyId) => void handleDeleteStrategy(strategyId)
                : undefined
            }
          />
          <main className="h-full flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl p-4 md:p-8">
              {isLoading && (
                <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
                  Loading the saved campaign…
                </p>
              )}
              {!isLoading && !campaign && (
                <p className="rounded-2xl bg-red-50 p-6 text-red-700">
                  {error ?? "Campaign could not be loaded."}
                </p>
              )}
              {campaign && (
                <ReviewPublishScreen
                  campaign={campaign}
                  brandName={me?.brand?.name ?? "Your brand"}
                  accounts={accounts}
                  accountsLoading={accountsLoading}
                  accountsError={accountsError}
                  onSaveDraft={
                    sourceStatus === "draft"
                      ? () => router.push("/panel/campaigns")
                      : undefined
                  }
                  onBack={() =>
                    router.push(
                      `/panel/campaigns/new?id=${encodeURIComponent(campaignId ?? "")}`,
                    )
                  }
                  onPublish={() => void handlePublish()}
                  publishing={isPublishing}
                  error={error}
                  publishLabel={
                    sourceStatus === "failed" ? "Retry publish" : undefined
                  }
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </PanelLayout>
  );
}
