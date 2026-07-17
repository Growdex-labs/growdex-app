"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import DottedBackground from "@/components/dotted-background";
import { Input } from "@/components/ui/input";
import { useMe } from "@/context/me-context";
import { apiFetch } from "@/lib/auth";
import {
  createCampaign,
  createInitialCampaignPayload,
  generateCampaignDraft,
  publishCampaign,
  searchMetaInterests,
  validateCampaignPayload,
  type CampaignCreativeInput,
  type CampaignCta,
  type CampaignGoal,
  type CampaignPlatform,
  type CreateCampaignPayload,
  type MetaInterest,
} from "@/lib/campaigns";
import { validateFile, isVideoUrl } from "@/lib/campaign-shared";
import { CLOUDINARY_FOLDER } from "@/lib/constants";
import { hashFolderName } from "@/lib/encrypt";
import { metaSpecialAdLocations } from "@/lib/meta-special-ad-locations";
import { connectSocialAccount } from "@/lib/oauth";
import { hydrateSocialAccounts } from "@/lib/social";
import type { SocialAccountSetupProps } from "@/types/social";
import { AiCampaignChat } from "../components/AiCampaignChat";
import { CampaignNameCard } from "../components/CampaignNameCard";
import { CampaignStepper } from "../components/CampaignStepper";
import { CampaignTreeSidebar } from "../components/CampaignTreeSidebar";
import {
  CreateMethodBox,
  type CreationMethod,
} from "../components/CreateMethodBox";
import { ReviewPublishScreen } from "../components/ReviewPublishScreen";

const STEPS = [
  "Setup campaign",
  "Choose platform",
  "Set campaign goals",
  "Target audience",
  "Budget and schedule",
  "Creative setup",
  "Review and publish",
];

const GOALS: Array<{ value: CampaignGoal; label: string; description: string }> = [
  { value: "AWARENESS", label: "Awareness", description: "Show your brand to more people." },
  { value: "TRAFFIC", label: "Traffic", description: "Send people to a website or landing page." },
  { value: "ENGAGEMENT", label: "Engagement", description: "Grow reactions, comments, shares, or views." },
  { value: "SALES", label: "Sales", description: "Drive purchases or other valuable actions." },
  { value: "LEADS", label: "Lead generation", description: "Collect contact details from potential customers." },
  { value: "APP_PROMOTION", label: "App promotion", description: "Drive app installs or in-app actions." },
];

const CTA_OPTIONS: Array<{ value: CampaignCta; label: string }> = [
  { value: "LEARN_MORE", label: "Learn more" },
  { value: "SHOP_NOW", label: "Shop now" },
  { value: "SIGN_UP", label: "Sign up" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "BOOK_NOW", label: "Book now" },
  { value: "CONTACT_US", label: "Contact us" },
  { value: "GET_QUOTE", label: "Get quote" },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "APPLY_NOW", label: "Apply now" },
  { value: "NO_BUTTON", label: "No button" },
];

const COUNTRIES = Object.entries(metaSpecialAdLocations).sort(([, a], [, b]) =>
  a.localeCompare(b),
);

const emptyCreative = (platform: CampaignPlatform): CampaignCreativeInput => ({
  platform,
  primaryText: "",
  headline: "",
  cta: "LEARN_MORE",
  mediaUrl: "",
  landingPageUrl: "",
});

const toDateTimeLocal = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const connected = (
  accounts: SocialAccountSetupProps | null,
  platform: CampaignPlatform,
) => Boolean(accounts?.[platform]?.connected && !accounts[platform]?.needsReauth);

function SelectionMark({ checked }: { checked: boolean }) {
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
      checked ? "border-khaki-300 bg-khaki-200" : "border-gray-300 bg-white"
    }`}>
      {checked && <Check className="h-3 w-3" />}
    </span>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { me } = useMe();
  const brandName = me?.brand?.name ?? "Your brand";
  const firstName = me?.profile?.firstName ?? "";
  const [campaign, setCampaign] = useState<CreateCampaignPayload>(() =>
    createInitialCampaignPayload(),
  );
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [goalConfirmed, setGoalConfirmed] = useState(false);
  const [step, setStep] = useState(0);
  const [accounts, setAccounts] = useState<SocialAccountSetupProps | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<CampaignPlatform | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [checkingInterests, setCheckingInterests] = useState(false);
  const [unavailableInterests, setUnavailableInterests] = useState<
    Record<string, MetaInterest[]>
  >({});
  const creativeCache = useRef(
    new Map<CampaignPlatform, CampaignCreativeInput>(),
  );

  useEffect(() => {
    let active = true;
    void hydrateSocialAccounts().then((result) => {
      if (!active) return;
      if (result.success) setAccounts(result.data ?? {});
      else setAccountError(result.error ?? "Could not load connected accounts.");
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedCountries = useMemo(
    () => new Set(campaign.audience.locations),
    [campaign.audience.locations],
  );

  const patch = (next: Partial<CreateCampaignPayload>) =>
    setCampaign((current) => ({ ...current, ...next }));

  const patchCampaign = (
    next: Partial<CreateCampaignPayload["campaign"]>,
  ) =>
    setCampaign((current) => ({
      ...current,
      campaign: { ...current.campaign, ...next },
    }));

  const patchAudience = (
    next: Partial<CreateCampaignPayload["audience"]>,
  ) =>
    setCampaign((current) => ({
      ...current,
      audience: { ...current.audience, ...next },
    }));

  const patchBudget = (next: Partial<CreateCampaignPayload["budget"]>) =>
    setCampaign((current) => ({
      ...current,
      budget: { ...current.budget, ...next },
    }));

  const setPlatforms = (platforms: CampaignPlatform[]) => {
    setCampaign((current) => {
      current.adContent.creatives.forEach((creative) =>
        creativeCache.current.set(creative.platform, creative),
      );
      return {
        ...current,
        campaign: { ...current.campaign, platforms },
        adContent: {
          creatives: platforms.map(
            (platform) =>
              creativeCache.current.get(platform) ?? emptyCreative(platform),
          ),
        },
      };
    });
  };

  const togglePlatform = (platform: CampaignPlatform) => {
    const selected = campaign.campaign.platforms.includes(platform);
    setPlatforms(
      selected
        ? campaign.campaign.platforms.filter((item) => item !== platform)
        : [...campaign.campaign.platforms, platform],
    );
  };

  const connect = async (platform: CampaignPlatform) => {
    setConnecting(platform);
    setAccountError(null);
    try {
      const result = await connectSocialAccount(platform);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? `Could not connect ${platform}.`);
      }
      setAccounts(result.data);
    } catch (failure) {
      setAccountError(
        failure instanceof Error ? failure.message : `Could not connect ${platform}.`,
      );
    } finally {
      setConnecting(null);
    }
  };

  const generateWithAi = async (prompt: string) => {
    setAiLoading(true);
    setError(null);
    try {
      const generated = await generateCampaignDraft({ prompt, brandName });
      const start = generated.budget.startDate
        ? new Date(generated.budget.startDate)
        : new Date(Date.now() + 30 * 60_000);
      const end = generated.budget.endDate
        ? new Date(generated.budget.endDate)
        : new Date(start);
      if (!generated.budget.endDate) {
        end.setUTCDate(end.getUTCDate() + generated.budget.durationDays);
      }
      const requestedName = campaign.campaign.name.trim();
      setCampaign({
        creationMode: "ai",
        campaign: {
          name: requestedName || generated.name,
          goal: generated.goal,
          platforms: generated.platforms,
        },
        audience: generated.audience,
        budget: {
          amount: generated.budget.amount,
          currency: generated.budget.currency,
          type: generated.budget.type,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        adContent: {
          creatives: generated.platforms.map((platform) => ({
            ...generated.creative,
            platform,
            mediaUrl: generated.creative.mediaUrl ?? "",
            landingPageUrl: generated.creative.landingPageUrl ?? "",
          })),
        },
      });
      setGoalConfirmed(true);
      setAiRationale(generated.rationale);
      setStep(1);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not generate the campaign draft.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const patchCreative = (index: number, next: Partial<CampaignCreativeInput>) => {
    setCampaign((current) => {
      const creatives = [...current.adContent.creatives];
      const platform = current.campaign.platforms[index];
      creatives[index] = {
        ...(creatives[index] ?? emptyCreative(platform)),
        ...next,
      };
      creativeCache.current.set(platform, creatives[index]);
      return { ...current, adContent: { creatives } };
    });
  };

  const uploadMedia = async (
    index: number,
    platform: CampaignPlatform,
    file: File,
  ) => {
    const validation = validateFile(file);
    if (!validation.ok) {
      setError(validation.error ?? "Unsupported media file.");
      return;
    }
    if (platform === "meta" && !file.type.startsWith("image/")) {
      setError("Meta creative must be an image.");
      return;
    }
    if (platform === "tiktok" && !file.type.startsWith("video/")) {
      setError("TikTok creative must be a video.");
      return;
    }

    setUploading(index);
    setError(null);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error("Cloudinary is not configured.");
      const encryptedFolder = await hashFolderName();
      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const publicId = `${encryptedFolder.slice(0, 20)}/${safeName}_${Date.now()}`;
      const signRes = await apiFetch("/media/signature-stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId, folder: CLOUDINARY_FOLDER }),
      });
      const signature = (await signRes.json().catch(() => ({}))) as {
        message?: string;
        api_key?: string;
        timestamp?: number;
        signature?: string;
      };
      if (!signRes.ok) {
        throw new Error(signature.message ?? "Could not authorize the upload.");
      }
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", String(signature.api_key));
      body.append("timestamp", String(signature.timestamp));
      body.append("signature", String(signature.signature));
      body.append("public_id", publicId);
      body.append("folder", CLOUDINARY_FOLDER);
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body },
      );
      const uploaded = (await uploadRes.json().catch(() => ({}))) as {
        secure_url?: string;
        error?: { message?: string };
      };
      if (!uploadRes.ok || !uploaded.secure_url) {
        throw new Error(uploaded.error?.message ?? "Media upload failed.");
      }
      patchCreative(index, { mediaUrl: uploaded.secure_url });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Media upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const validateMetaAudienceInterests = async () => {
    const interests = campaign.audience.interests ?? [];
    if (!campaign.campaign.platforms.includes("meta") || !interests.length) {
      setUnavailableInterests({});
      return true;
    }

    setCheckingInterests(true);
    try {
      const results = await Promise.all(
        interests.map(async (interest) => ({
          interest,
          matches: await searchMetaInterests(interest),
        })),
      );
      const unavailable: Record<string, MetaInterest[]> = {};
      const canonicalNames: string[] = [];

      for (const { interest, matches } of results) {
        const exact = matches.find(
          (match) => match.name.trim().toLowerCase() === interest.toLowerCase(),
        );
        if (exact) canonicalNames.push(exact.name);
        else unavailable[interest] = matches.slice(0, 5);
      }

      if (Object.keys(unavailable).length) {
        setUnavailableInterests(unavailable);
        setError("Choose available Meta interests before continuing.");
        return false;
      }

      setUnavailableInterests({});
      patchAudience({ interests: canonicalNames });
      return true;
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not validate Meta interests.",
      );
      return false;
    } finally {
      setCheckingInterests(false);
    }
  };

  const replaceUnavailableInterest = (
    unavailable: string,
    replacement: string,
  ) => {
    patchAudience({
      interests: (campaign.audience.interests ?? []).map((interest) =>
        interest.toLowerCase() === unavailable.toLowerCase()
          ? replacement
          : interest,
      ),
    });
    setUnavailableInterests((current) => {
      const nextUnavailable = { ...current };
      delete nextUnavailable[unavailable];
      return nextUnavailable;
    });
    setError(null);
  };

  const next = async () => {
    setError(null);
    if (step === 0 && !campaign.campaign.name.trim()) {
      setError("Enter a campaign name.");
      return;
    }
    if (step === 1 && !campaign.campaign.platforms.length) {
      setError("Choose at least one advertising platform.");
      return;
    }
    if (step === 2 && !goalConfirmed) {
      setError("Choose a campaign goal before continuing.");
      return;
    }
    if (step === 3 && !campaign.audience.locations.length) {
      setError("Choose at least one audience location.");
      return;
    }
    if (step === 3 && !(await validateMetaAudienceInterests())) return;
    if (step === 4 && campaign.budget.amount <= 0) {
      setError("Enter a budget greater than zero.");
      return;
    }
    if (step === 5) {
      const validation = validateCampaignPayload(campaign);
      if (validation) {
        setError(validation);
        return;
      }
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const createDraft = async () => {
    const validation = validateCampaignPayload(campaign);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createCampaign(campaign);
      router.push(`/panel/campaigns/new/publish?id=${encodeURIComponent(created.id)}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save the campaign.");
      setSaving(false);
    }
  };

  const createAndPublish = async () => {
    const validation = validateCampaignPayload(campaign);
    if (validation) {
      setError(validation);
      return;
    }
    const missingConnection = campaign.campaign.platforms.find(
      (platform) => !connected(accounts, platform),
    );
    if (missingConnection) {
      setError(
        `Connect ${missingConnection === "meta" ? "Meta" : "TikTok"} before publishing. You can still save this campaign as a draft.`,
      );
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const created = await createCampaign(campaign);
      await publishCampaign(created.id);
      router.push("/panel/campaigns");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not publish the campaign.");
      setPublishing(false);
    }
  };

  const stepper = (
    <CampaignStepper
      steps={STEPS}
      current={step}
      activeGradient={campaign.creationMode === "ai"}
      onStepClick={(index) => index <= step && setStep(index)}
    />
  );

  const nav = step < STEPS.length - 1 && (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => setStep((current) => Math.max(0, current - 1))}
        disabled={step === 0}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:invisible"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <button
        type="button"
        onClick={() => void next()}
        disabled={uploading !== null || checkingInterests}
        className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 disabled:opacity-50"
      >
        {checkingInterests ? "Checking interests…" : "Continue"} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <PanelLayout>
      <div className="relative flex h-full">
        <DottedBackground fade />
        <div className="relative z-10 flex h-full w-full">
          <CampaignTreeSidebar
            campaignName={campaign.campaign.name || "Untitled campaign"}
            adGroups={[]}
          />
          <main className="h-full flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl p-4 md:p-8">
              <div className="mb-8">{stepper}</div>

              {aiRationale && step > 0 && step < 6 && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                  <p><span className="font-semibold">AI draft:</span> {aiRationale} Review every choice before publishing.</p>
                </div>
              )}

              {error && step < 6 && (
                <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
              )}

              {step === 0 && (
                <div className="space-y-6">
                  <CampaignNameCard
                    value={campaign.campaign.name}
                    onChange={(name) =>
                      patchCampaign({ name })
                    }
                  />
                  {method !== "ai" ? (
                    <CreateMethodBox
                      value={method}
                      onSelect={(nextMethod) => {
                        setMethod(nextMethod);
                        patch({ creationMode: nextMethod });
                        setError(null);
                        if (nextMethod === "manual") {
                          setGoalConfirmed(false);
                          setStep(1);
                        }
                      }}
                    />
                  ) : aiLoading ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-violet-100 bg-white p-8 text-center shadow-sm">
                      <Loader2 className="h-9 w-9 animate-spin text-violet-500" />
                      <h2 className="mt-5 text-xl font-semibold text-gray-900">Creating an editable campaign draft</h2>
                      <p className="mt-2 max-w-md text-sm text-gray-500">Growdex is choosing a goal, platforms, audience, budget, and ad copy from your request.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setMethod(null)}
                        className="ml-6 mt-5 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
                      >
                        <ArrowLeft className="h-4 w-4" /> Change creation method
                      </button>
                      <AiCampaignChat
                        firstName={firstName}
                        onSubmit={(prompt) => void generateWithAi(prompt)}
                        suggestions={[
                          "Launch a lead campaign for my business in Nigeria",
                          "Promote a new product to young adults",
                          "Drive qualified visitors to my website",
                        ]}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold text-gray-900">What platforms are you running this ad on?</h2>
                  <p className="mt-2 text-sm text-gray-500">You can build a draft before connecting an account. A live connection is required to publish.</p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {(["meta", "tiktok"] as CampaignPlatform[]).map((platform) => {
                      const isSelected = campaign.campaign.platforms.includes(platform);
                      const isConnected = connected(accounts, platform);
                      const accountName = platform === "meta"
                        ? accounts?.meta?.assets?.[0]?.adAccountName
                        : accounts?.tiktok?.assets?.[0]?.name;
                      return (
                        <div key={platform} className={`rounded-xl border p-4 ${isSelected ? "border-khaki-300" : "border-gray-200"}`}>
                          <button type="button" onClick={() => togglePlatform(platform)} className="flex w-full items-center gap-3 text-left">
                            <SelectionMark checked={isSelected} />
                            <div className="flex-1">
                              <p className="font-semibold capitalize text-gray-900">{platform === "meta" ? "Meta" : "TikTok"}</p>
                              <p className="mt-0.5 text-xs text-gray-400">{accountName || (isConnected ? "Connected account" : "No account connected")}</p>
                            </div>
                            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`} />
                          </button>
                          {!isConnected && (
                            <button
                              type="button"
                              onClick={() => void connect(platform)}
                              disabled={connecting !== null}
                              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {connecting === platform ? "Connecting…" : `Connect ${platform === "meta" ? "Meta" : "TikTok"}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {accountError && <p className="mt-4 text-sm text-red-600">{accountError}</p>}
                </section>
              )}

              {step === 2 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold text-gray-900">What is the goal for your campaign?</h2>
                  <div className="mt-6 space-y-3">
                    {GOALS.map((goal) => {
                      const selected =
                        goalConfirmed && campaign.campaign.goal === goal.value;
                      return (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => {
                            patchCampaign({ goal: goal.value });
                            setGoalConfirmed(true);
                            setError(null);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left ${selected ? "border-khaki-300" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-gray-800" : "border-gray-300"}`}>
                            {selected && <span className="h-2.5 w-2.5 rounded-full bg-gray-800" />}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-gray-900">{goal.label}</span>
                            <span className="block text-xs text-gray-400">{goal.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold text-gray-900">Find the people you want to reach</h2>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      Add a country
                      <select
                        className="mt-2 h-11 w-full rounded-lg border bg-white px-3"
                        value=""
                        onChange={(event) => {
                          const code = event.target.value;
                          if (code && !selectedCountries.has(code)) {
                            patchAudience({
                              locations: [...campaign.audience.locations, code],
                            });
                          }
                        }}
                      >
                        <option value="">Choose a country</option>
                        {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Gender
                      <select
                        className="mt-2 h-11 w-full rounded-lg border bg-white px-3"
                        value={campaign.audience.gender ?? "all"}
                        onChange={(event) =>
                          patchAudience({
                            gender: event.target.value as
                              | "all"
                              | "male"
                              | "female",
                          })
                        }
                      >
                        <option value="all">All</option>
                        <option value="female">Women</option>
                        <option value="male">Men</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {campaign.audience.locations.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() =>
                          campaign.audience.locations.length > 1 &&
                          patchAudience({
                            locations: campaign.audience.locations.filter(
                              (item) => item !== code,
                            ),
                          })
                        }
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {metaSpecialAdLocations[code as keyof typeof metaSpecialAdLocations] ?? code} ×
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <label className="text-sm font-medium text-gray-700">Minimum age<Input className="mt-2" type="number" min={18} max={65} value={campaign.audience.ageMin ?? 18} onChange={(event) => patchAudience({ ageMin: Number(event.target.value) })} /></label>
                    <label className="text-sm font-medium text-gray-700">Maximum age<Input className="mt-2" type="number" min={18} max={65} value={campaign.audience.ageMax ?? 65} onChange={(event) => patchAudience({ ageMax: Number(event.target.value) })} /></label>
                    <label className="text-sm font-medium text-gray-700">
                      Interests
                      <Input
                        className="mt-2"
                        value={(campaign.audience.interests ?? []).join(", ")}
                        onChange={(event) => {
                          patchAudience({
                            interests: event.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          });
                          setUnavailableInterests({});
                        }}
                        placeholder="Business, technology"
                      />
                    </label>
                  </div>
                  {Object.entries(unavailableInterests).map(
                    ([unavailable, suggestions]) => (
                      <div
                        key={unavailable}
                        className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"
                      >
                        <p className="text-sm font-medium text-amber-900">
                          “{unavailable}” is not an available Meta interest.
                        </p>
                        {suggestions.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                onClick={() =>
                                  replaceUnavailableInterest(
                                    unavailable,
                                    suggestion.name,
                                  )
                                }
                                className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
                              >
                                Use {suggestion.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-amber-800">
                            Remove it or enter a different interest.
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </section>
              )}

              {step === 4 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold text-gray-900">How much do you want to spend?</h2>
                  <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm font-medium text-gray-700">Amount<Input className="mt-2" type="number" min="0.01" step="0.01" value={campaign.budget.amount || ""} onChange={(event) => patchBudget({ amount: Number(event.target.value) })} /></label>
                    <label className="text-sm font-medium text-gray-700">Currency<select className="mt-2 h-10 w-full rounded-md border bg-white px-3" value={campaign.budget.currency} onChange={(event) => patchBudget({ currency: event.target.value as "NGN" | "USD" })}><option value="NGN">NGN</option><option value="USD">USD</option></select></label>
                    <label className="text-sm font-medium text-gray-700">Budget type<select className="mt-2 h-10 w-full rounded-md border bg-white px-3" value={campaign.budget.type} onChange={(event) => patchBudget({ type: event.target.value as "daily" | "lifetime" })}><option value="daily">Daily</option><option value="lifetime">Lifetime</option></select></label>
                    <label className="text-sm font-medium text-gray-700">Start time<Input className="mt-2" type="datetime-local" value={toDateTimeLocal(campaign.budget.startDate)} onChange={(event) => event.target.value && patchBudget({ startDate: new Date(event.target.value).toISOString() })} /></label>
                    <label className="text-sm font-medium text-gray-700">End time (optional)<Input className="mt-2" type="datetime-local" value={toDateTimeLocal(campaign.budget.endDate)} onChange={(event) => patchBudget({ endDate: event.target.value ? new Date(event.target.value).toISOString() : undefined })} /></label>
                  </div>
                </section>
              )}

              {step === 5 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold text-gray-900">Setup your ad creatives</h2>
                  <p className="mt-2 text-sm text-gray-500">Each platform gets its own copy and media in the order shown.</p>
                  <div className="mt-6 space-y-6">
                    {campaign.campaign.platforms.map((platform, index) => {
                      const creative = campaign.adContent.creatives[index] ?? emptyCreative(platform);
                      return (
                        <fieldset key={platform} className="rounded-xl border border-gray-200 p-5">
                          <legend className="px-2 font-semibold capitalize text-gray-900">{platform === "meta" ? "Meta image ad" : "TikTok video ad"}</legend>
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-gray-700 md:col-span-2">Primary text<textarea className="mt-2 min-h-24 w-full rounded-lg border p-3" maxLength={125} value={creative.primaryText} onChange={(event) => patchCreative(index, { primaryText: event.target.value })} /></label>
                            <label className="text-sm font-medium text-gray-700">Headline<Input className="mt-2" maxLength={40} value={creative.headline ?? ""} onChange={(event) => patchCreative(index, { headline: event.target.value })} /></label>
                            <label className="text-sm font-medium text-gray-700">Call to action<select className="mt-2 h-10 w-full rounded-md border bg-white px-3" value={creative.cta} onChange={(event) => patchCreative(index, { cta: event.target.value as CampaignCta })}>{CTA_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                            <label className="text-sm font-medium text-gray-700 md:col-span-2">Landing page URL{platform === "meta" ? " *" : ""}<Input className="mt-2" type="url" value={creative.landingPageUrl ?? ""} onChange={(event) => patchCreative(index, { landingPageUrl: event.target.value || undefined })} placeholder="https://example.com/offer" /></label>
                            {campaign.campaign.goal === "LEADS" && <label className="text-sm font-medium text-gray-700 md:col-span-2">Lead form ID<Input className="mt-2" value={creative.leadFormId ?? ""} onChange={(event) => patchCreative(index, { leadFormId: event.target.value })} /></label>}
                            {campaign.campaign.goal === "APP_PROMOTION" && <label className="text-sm font-medium text-gray-700 md:col-span-2">App ID<Input className="mt-2" value={creative.appId ?? ""} onChange={(event) => patchCreative(index, { appId: event.target.value })} /></label>}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Hosted media URL
                                <Input
                                  className="mt-2"
                                  type="url"
                                  value={creative.mediaUrl}
                                  onChange={(event) => patchCreative(index, { mediaUrl: event.target.value })}
                                  placeholder="https://res.cloudinary.com/…"
                                />
                              </label>
                              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                {uploading === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                                {uploading === index ? "Uploading…" : `Upload ${platform === "meta" ? "image" : "video"}`}
                                <input className="hidden" type="file" disabled={uploading !== null} accept={platform === "meta" ? "image/*" : "video/*"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(index, platform, file); event.target.value = ""; }} />
                              </label>
                              {creative.mediaUrl && (
                                <div className="mt-4 overflow-hidden rounded-xl border bg-gray-50">
                                  {isVideoUrl(creative.mediaUrl) ? <video className="max-h-72 w-full object-contain" src={creative.mediaUrl} controls /> : <Image className="max-h-72 w-full object-contain" src={creative.mediaUrl} alt={`${platform} creative`} width={800} height={450} unoptimized />}
                                </div>
                              )}
                            </div>
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 6 && (
                <ReviewPublishScreen
                  campaign={campaign}
                  brandName={brandName}
                  onBack={() => setStep(5)}
                  onSaveDraft={() => void createDraft()}
                  onPublish={() => void createAndPublish()}
                  saving={saving}
                  publishing={publishing}
                  error={error}
                />
              )}

              {step > 0 && nav}
            </div>
          </main>
        </div>
      </div>
    </PanelLayout>
  );
}
