"use client";

import { use } from "react";
import { CampaignSetupWorkspace } from "../../components/campaign-setup-workspace";

export default function EditLiveCampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  return <CampaignSetupWorkspace mode="live" campaignId={campaignId} />;
}
