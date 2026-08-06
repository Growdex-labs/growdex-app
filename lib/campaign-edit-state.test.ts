import { describe, expect, it } from "vitest";
import {
  createInitialCampaignPayload,
  type CreateCampaignPayload,
} from "./campaigns";
import { getCampaignRepairStep } from "./campaign-edit-state";

const editableCampaign = (): CreateCampaignPayload => {
  const campaign = createInitialCampaignPayload();
  const strategy = campaign.audienceStrategies[0]!;

  campaign.campaign.name = "Saved campaign";
  campaign.campaign.platforms = ["meta"];
  campaign.campaign.configuration.accountAssetIds = { meta: "account-1" };
  strategy.budget.amount = 100;
  strategy.ads = [
    {
      platform: "meta",
      primaryText: "Primary text",
      headline: "Headline",
      cta: "LEARN_MORE",
      mediaUrl: "https://cdn.example.com/ad.jpg",
      landingPageUrl: "https://example.com",
    },
  ];

  return campaign;
};

describe("getCampaignRepairStep", () => {
  it("opens an incomplete platform selection instead of rejecting the draft", () => {
    const campaign = editableCampaign();
    campaign.campaign.platforms = [];

    expect(getCampaignRepairStep(campaign)).toBe(1);
  });

  it("opens an incomplete audience at audience targeting", () => {
    const campaign = editableCampaign();
    campaign.audienceStrategies[0]!.audience.locations = [];

    expect(getCampaignRepairStep(campaign)).toBe(4);
  });

  it("opens a campaign with no ads at creative setup", () => {
    const campaign = editableCampaign();
    campaign.audienceStrategies[0]!.ads = [];

    expect(getCampaignRepairStep(campaign)).toBe(6);
  });

  it("opens a complete campaign at review", () => {
    expect(getCampaignRepairStep(editableCampaign())).toBe(7);
  });
});
