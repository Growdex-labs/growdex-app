"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PanelLayout } from "../../../components/panel-layout";
import { CampaignsSidebar } from "../../../components/campaigns-sidebar";
import {
  campaignDtoToPayload,
  fetchCampaignById,
  publishCampaign,
  updateCampaign,
  type CreateCampaignPayload,
} from "@/lib/campaigns";
import {
  CampaignForm,
  validateCampaignPayload,
} from "../../components/CampaignForm";

export default function PublishCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const [campaign, setCampaign] = useState<CreateCampaignPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
          throw new Error("Only draft campaigns can be reviewed and edited.");
        }
        setCampaign(campaignDtoToPayload(result));
      })
      .catch((failure) => {
        if (!active) return;
        setError(failure instanceof Error ? failure.message : "Could not load campaign.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [campaignId, router]);

  const validate = () => {
    if (!campaign) return "Campaign is still loading.";
    return validateCampaignPayload(campaign);
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError || !campaignId || !campaign) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateCampaign(campaignId, campaign);
      setCampaign(campaignDtoToPayload(updated));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validate();
    if (validationError || !campaignId || !campaign) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsPublishing(true);
    try {
      await updateCampaign(campaignId, campaign);
      await publishCampaign(campaignId);
      router.push("/panel/campaigns");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not publish campaign.");
      setIsPublishing(false);
    }
  };

  return (
    <PanelLayout>
      <div className="flex h-full">
        <CampaignsSidebar />
        <main className="h-full flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Review campaign</h1>
              <p className="mt-2 text-gray-600">
                Changes are saved before publishing, so the campaign you review is the campaign that goes live.
              </p>
            </div>

            {isLoading && <p className="rounded-xl bg-white p-6 text-gray-600">Loading campaign…</p>}
            {!isLoading && !campaign && (
              <p className="rounded-xl bg-red-50 p-6 text-red-700">
                {error ?? "Campaign could not be loaded."}
              </p>
            )}
            {campaign && (
              <CampaignForm
                value={campaign}
                onChange={setCampaign}
                onSubmit={handlePublish}
                onSecondaryAction={handleSave}
                submitLabel="Save and publish"
                secondaryLabel="Save draft"
                busy={isPublishing}
                secondaryBusy={isSaving}
                error={error}
              />
            )}
          </div>
        </main>
      </div>
    </PanelLayout>
  );
}
