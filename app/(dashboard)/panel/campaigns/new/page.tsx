"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import { createCampaign, type CreateCampaignPayload } from "@/lib/campaigns";
import {
  CampaignForm,
  createInitialCampaignPayload,
  validateCampaignPayload,
} from "../components/CampaignForm";

export default function NewCampaignPage() {
  const router = useRouter();
  const [campaign, setCampaign] = useState<CreateCampaignPayload>(
    createInitialCampaignPayload,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const validationError = validateCampaignPayload(campaign);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsCreating(true);
    try {
      const created = await createCampaign(campaign);
      router.push(`/panel/campaigns/new/publish?id=${encodeURIComponent(created.id)}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Campaign creation failed.",
      );
      setIsCreating(false);
    }
  };

  return (
    <PanelLayout>
      <div className="flex h-full">
        <CampaignsSidebar />
        <main className="h-full flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">New campaign</h1>
              <p className="mt-2 text-gray-600">
                Create a draft, review every detail, then publish it to your connected account.
              </p>
            </div>
            <CampaignForm
              value={campaign}
              onChange={setCampaign}
              onSubmit={handleCreate}
              submitLabel="Save and review"
              busy={isCreating}
              error={error}
            />
          </div>
        </main>
      </div>
    </PanelLayout>
  );
}
