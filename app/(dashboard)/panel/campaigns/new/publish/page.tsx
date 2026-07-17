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
  type CreateCampaignPayload,
} from "@/lib/campaigns";
import { CampaignTreeSidebar } from "../../components/CampaignTreeSidebar";
import { ReviewPublishScreen } from "../../components/ReviewPublishScreen";

export default function PublishCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const { me } = useMe();
  const [campaign, setCampaign] = useState<CreateCampaignPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      router.replace("/panel/campaigns/new");
      return;
    }

    let active = true;
    void fetchCampaignById(campaignId)
      .then((result) => {
        if (!active) return;
        if (result.status && result.status !== "draft") {
          throw new Error("Only draft campaigns can be published from this screen.");
        }
        setCampaign(campaignDtoToPayload(result));
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

  return (
    <PanelLayout>
      <div className="relative flex h-full">
        <DottedBackground fade />
        <div className="relative z-10 flex h-full w-full">
          <CampaignTreeSidebar
            campaignName={campaign?.campaign.name ?? "Campaign review"}
            adGroups={[]}
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
                  onSaveDraft={() => router.push("/panel/campaigns")}
                  onPublish={() => void handlePublish()}
                  publishing={isPublishing}
                  error={error}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </PanelLayout>
  );
}
