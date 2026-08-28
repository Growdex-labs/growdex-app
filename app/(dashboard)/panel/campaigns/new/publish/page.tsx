"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PanelLayout } from "../../../components/panel-layout";
import DottedBackground from "@/components/dotted-background";
import { useMe } from "@/context/me-context";
import { proDisabledReason } from "@/lib/billing";
import {
  campaignDtoToPayload,
  ensureCampaignPayloadScheduleLeadTime,
  fetchCampaignById,
  publishCampaign,
  updateCampaignDraft,
  validateCampaignPayload,
  type CreateCampaignPayload,
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
  const [strategyMutationPending, setStrategyMutationPending] = useState(false);
  const strategyMutationPendingRef = useRef(false);

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
      .catch((failure) => {
        if (!active) return;
        setAccountsError(
          failure instanceof Error
            ? failure.message
            : "Could not load connected accounts.",
        );
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
        const savedPayload = campaignDtoToPayload(result);
        // A draft can save a refreshed start time before publishing. A failed
        // campaign retries its exact saved version so any partial remote work
        // can be resumed; changing its schedule requires opening the editor.
        const payload =
          result.status === "failed"
            ? savedPayload
            : ensureCampaignPayloadScheduleLeadTime(savedPayload);
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
    if (!campaignId || !campaign) return;
    if (campaign.creationMode === "unknown") {
      setError(
        "This draft was saved with an older campaign format. Open it in the editor and choose a setup method before publishing.",
      );
      return;
    }
    const validationError = validateCampaignPayload(campaign);
    if (validationError) {
      setError(validationError);
      return;
    }
    const planBlock = proDisabledReason(me);
    if (planBlock) {
      setError(planBlock);
      return;
    }
    setIsPublishing(true);
    setError(null);
    try {
      if (sourceStatus === "draft") {
        const writableCampaign: CreateCampaignPayload = {
          ...campaign,
          creationMode: campaign.creationMode,
        };
        // Drafts created under an older contract can contain nullable optional
        // fields. Re-saving converts them to the current write contract before
        // the backend builds the provider request.
        const savedCampaign = await updateCampaignDraft(
          campaignId,
          writableCampaign,
        );
        setCampaign(campaignDtoToPayload(savedCampaign));
      }
      // A failed publish keeps any remote IDs that were already created. Retry
      // the saved version directly so the publisher can continue that work
      // without replacing it with duplicate provider objects.
      await publishCampaign(campaignId);
      router.push("/panel/campaigns");
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not publish the campaign.",
      );
      setIsPublishing(false);
    }
  };

  const scrollToStrategy = (strategyId: string) => {
    setActiveStrategyId(strategyId);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`review-strategy-${strategyId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDuplicateStrategy = async (strategyId: string) => {
    if (
      !campaignId ||
      !campaign ||
      sourceStatus !== "draft" ||
      strategyMutationPendingRef.current
    ) return;
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
    strategyMutationPendingRef.current = true;
    setStrategyMutationPending(true);
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
    } finally {
      strategyMutationPendingRef.current = false;
      setStrategyMutationPending(false);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (
      !campaignId ||
      !campaign ||
      sourceStatus !== "draft" ||
      campaign.audienceStrategies.length === 1
      || strategyMutationPendingRef.current
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
    strategyMutationPendingRef.current = true;
    setStrategyMutationPending(true);
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
    } finally {
      strategyMutationPendingRef.current = false;
      setStrategyMutationPending(false);
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
            activeStrategyLabel="Selected"
            onSelectStrategy={scrollToStrategy}
            onEditStrategy={(strategyId) =>
              router.push(
                `/panel/campaigns/new?id=${encodeURIComponent(campaignId ?? "")}&strategy=${encodeURIComponent(strategyId)}`,
              )
            }
            onSelectAd={(strategyId, adIndex) =>
              router.push(
                `/panel/campaigns/new?id=${encodeURIComponent(campaignId ?? "")}&strategy=${encodeURIComponent(strategyId)}&ad=${adIndex}`,
              )
            }
            onDuplicateStrategy={
              sourceStatus === "draft" && !strategyMutationPending
                ? (strategyId) => void handleDuplicateStrategy(strategyId)
                : undefined
            }
            onDeleteStrategy={
              sourceStatus === "draft" && !strategyMutationPending
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
                  onEditStrategy={(strategyId) =>
                    router.push(
                      `/panel/campaigns/new?id=${encodeURIComponent(campaignId ?? "")}&strategy=${encodeURIComponent(strategyId)}`,
                    )
                  }
                  onPublish={() => void handlePublish()}
                  publishing={isPublishing}
                  error={error}
                  disabledReason={proDisabledReason(me)}
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
