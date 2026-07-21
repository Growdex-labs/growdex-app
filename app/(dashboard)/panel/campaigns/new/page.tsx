"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import DottedBackground from "@/components/dotted-background";
import { useMe } from "@/context/me-context";
import { apiFetch, isDevelopmentMockSessionActive } from "@/lib/auth";
import {
  createCampaign,
  createInitialCampaignPayload,
  campaignDtoToPayload,
  fetchCampaignById,
  hasRestrictedMetaTargeting,
  answerAiCampaignQuestion,
  AI_CAMPAIGN_STEP_IDS,
  publishCampaign,
  reviseAiCampaignDraft,
  requestCampaignName,
  searchMetaInterests,
  startAiCampaignDraft,
  updateCampaign,
  validateCampaignCreativeSetup,
  validateCampaignDraftPayload,
  validateCampaignPayload,
  type AiCampaignDraftResponse,
  type AiCampaignQuestion,
  type AiCampaignStepId,
  type CampaignCreativeInput,
  type CampaignConfiguration,
  type CampaignCta,
  type CampaignPlatform,
  type CreateCampaignPayload,
  type GeneratedCampaignDraft,
  type MetaInterest,
  type MetaSpecialAdCategory,
} from "@/lib/campaigns";
import { validateFile } from "@/lib/campaign-shared";
import { CLOUDINARY_FOLDER } from "@/lib/constants";
import { hashFolderName } from "@/lib/encrypt";
import { connectSocialAccount } from "@/lib/oauth";
import { hydrateSocialAccounts, refreshSocialAccount } from "@/lib/social";
import type { SocialAccountSetupProps } from "@/types/social";
import { AiCampaignWorkspace } from "../components/AiCampaignWorkspace";
import type { AiMessage } from "../components/AiSidePanel";
import { AdCreatedModal } from "../components/AdCreatedModal";
import type { AiStep, AiStepStatus } from "../components/use-ai-campaign-flow";
import { useAiCampaignFlow } from "../components/use-ai-campaign-flow";
import { AudienceTargetingScreen } from "../components/AudienceTargetingScreen";
import { CampaignBudgetEditor } from "../components/CampaignBudgetEditor";
import { CampaignNameCard } from "../components/CampaignNameCard";
import { CampaignStepper } from "../components/CampaignStepper";
import { CampaignTreeSidebar } from "../components/CampaignTreeSidebar";
import { CreativeSetupScreen } from "../components/CreativeSetupScreen";
import { ManualEventManagementScreen } from "../components/ManualEventManagementScreen";
import { ManualEventScreen } from "../components/ManualEventScreen";
import { ManualGoalScreen } from "../components/ManualGoalScreen";
import { ManualPlatformScreen } from "../components/ManualPlatformScreen";
import {
  CreateMethodBox,
  type CreationMethod,
} from "../components/CreateMethodBox";
import { ReviewPublishScreen } from "../components/ReviewPublishScreen";

const STEPS = [
  "Setup campaign",
  "Choose platform",
  "Set campaign goals",
  "Event management",
  "Budget and schedule",
  "Creative setup",
  "Review and publish",
];

const EMPTY_AI_RATIONALES = {
  setup: "The model has not generated this decision yet.",
  goal: "The model has not generated this decision yet.",
  platforms: "The model has not generated this decision yet.",
  event: "The model has not generated this decision yet.",
  audience: "The model has not generated this decision yet.",
  budget: "The model has not generated this decision yet.",
  creative: "The model has not generated this decision yet.",
};

const AI_DRAFT_STORAGE_KEY = "growdex.aiCampaignDraft.v3";
const subscribeToStaticBrowserState = () => () => undefined;

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

const emptyCreative = (platform: CampaignPlatform): CampaignCreativeInput => ({
  platform,
  primaryText: "",
  headline: "",
  cta: "LEARN_MORE",
  mediaUrl: "",
  landingPageUrl: "",
});

const connected = (
  accounts: SocialAccountSetupProps | null,
  platform: CampaignPlatform,
) =>
  Boolean(accounts?.[platform]?.connected && !accounts[platform]?.needsReauth);

const aiStepSnapshot = (
  draft: GeneratedCampaignDraft,
  step: AiCampaignStepId,
) => {
  switch (step) {
    case "setup":
      return draft.name;
    case "platform":
      return {
        platforms: draft.platforms,
        accountAssetIds: draft.configuration.accountAssetIds,
      };
    case "goals":
      return {
        goal: draft.goal,
        specialAdCategories: draft.configuration.specialAdCategories,
      };
    case "event":
      return {
        destination: draft.configuration.destination,
        optimizationGoal: draft.configuration.optimizationGoal,
        eventSourceIds: draft.configuration.eventSourceIds,
      };
    case "audience":
      return draft.audience;
    case "budget":
      return draft.budget;
    case "creative":
      return draft.creatives;
  }
};

const campaignToAiDraft = (
  campaign: CreateCampaignPayload,
  previous: GeneratedCampaignDraft,
): GeneratedCampaignDraft => {
  const start = new Date(campaign.budget.startDate);
  const end = campaign.budget.endDate
    ? new Date(campaign.budget.endDate)
    : null;
  const durationDays = end
    ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
    : previous.budget.durationDays;
  return {
    ...previous,
    name: campaign.campaign.name,
    goal: campaign.campaign.goal,
    platforms: campaign.campaign.platforms,
    configuration: campaign.campaign.configuration,
    audience: campaign.audience,
    budget: {
      amount: campaign.budget.amount,
      currency: campaign.budget.currency,
      type: campaign.budget.type,
      durationDays,
      startDateLocal: campaign.budget.startDate,
      endDateLocal: campaign.budget.endDate,
    },
    creatives: campaign.adContent.creatives.map((creative) => ({
      ...creative,
      mediaRequirement: creative.platform === "meta" ? "image" : "video",
      mediaStatus: creative.mediaUrl ? "ready" : "required",
    })),
  };
};

const toUiMessages = (
  messages: AiCampaignDraftResponse["messages"],
): AiMessage[] =>
  messages.map((message, index) => ({
    id: `session-${index}-${message.role}-${message.content.slice(0, 12)}`,
    sender: message.role === "user" ? "user" : "ai",
    text: message.content,
  }));

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCampaignId = searchParams.get("id");
  const { me } = useMe();
  const brandName = me?.brand?.name ?? "Your brand";
  const firstName = me?.profile?.firstName ?? "";
  const [campaign, setCampaign] = useState<CreateCampaignPayload>(() =>
    createInitialCampaignPayload(),
  );
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [goalConfirmed, setGoalConfirmed] = useState(false);
  const [step, setStep] = useState(0);
  const [accounts, setAccounts] = useState<SocialAccountSetupProps | null>(
    null,
  );
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<CampaignPlatform | null>(null);
  const [generatingName, setGeneratingName] = useState(false);
  const [nameRationale, setNameRationale] = useState<string | null>(null);
  const isDevelopmentMockSession = useSyncExternalStore(
    subscribeToStaticBrowserState,
    isDevelopmentMockSessionActive,
    () => false,
  );
  const aiDisabledReason = isDevelopmentMockSession
    ? "Real AI is unavailable in the development quick-login session. Sign in with a real Growdex account to generate or revise campaign decisions."
    : null;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiDraftId, setAiDraftId] = useState<string | null>(null);
  const [aiDraftRevision, setAiDraftRevision] = useState(0);
  const [aiGeneratedDraft, setAiGeneratedDraft] =
    useState<GeneratedCampaignDraft | null>(null);
  const [aiQuestion, setAiQuestion] = useState<AiCampaignQuestion | null>(null);
  const [aiStepRationales, setAiStepRationales] = useState(EMPTY_AI_RATIONALES);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(null);
  const [editingCampaignLoading, setEditingCampaignLoading] = useState(
    Boolean(editCampaignId),
  );
  const [completion, setCompletion] = useState<{
    kind: "draft" | "publish";
    campaignId: string;
  } | null>(null);
  const [checkingInterests, setCheckingInterests] = useState(false);
  const [unavailableInterests, setUnavailableInterests] = useState<
    Record<string, MetaInterest[]>
  >({});
  const creativeCache = useRef(
    new Map<CampaignPlatform, CampaignCreativeInput[]>(),
  );
  const aiRequestIdRef = useRef(0);
  const aiAbortRef = useRef<AbortController | null>(null);
  const createIdempotencyKeyRef = useRef(crypto.randomUUID());
  const publishAttemptRef = useRef<{
    campaignId: string;
    fingerprint: string;
    key: string;
  } | null>(null);
  const aiSessionRestoredRef = useRef(false);
  const aiFlow = useAiCampaignFlow(campaign, aiStepRationales);
  const aiReadinessNotice = aiGeneratedDraft
    ? campaign.campaign.platforms.some(
        (platform) =>
          !campaign.campaign.configuration.accountAssetIds?.[platform],
      )
      ? "Select a connected ad account for every platform before publishing."
      : campaign.campaign.configuration.optimizationGoal === "CONVERSIONS" &&
          campaign.campaign.platforms.some(
            (platform) =>
              !campaign.campaign.configuration.eventSourceIds?.[platform],
          )
        ? "Select every required conversion event source before publishing."
        : campaign.adContent.creatives.some((creative) => !creative.mediaUrl)
          ? "Add the required Meta images and TikTok videos before publishing."
          : null
    : null;
  const aiPostReviewStep = validateCampaignCreativeSetup(campaign) ? 5 : 6;
  const aiPostReviewLabel =
    aiPostReviewStep === 5
      ? "Continue to creative setup"
      : "Review and publish";
  const selectedMetaAsset = accounts?.meta?.assets?.find(
    (asset) =>
      asset.id === campaign.campaign.configuration.accountAssetIds?.meta,
  );
  const selectedMetaAccountRules =
    selectedMetaAsset?.currency &&
    selectedMetaAsset.timezoneName &&
    typeof selectedMetaAsset.minDailyBudgetMinor === "number"
      ? {
          timezoneName: selectedMetaAsset.timezoneName,
          minimumDailyBudget: selectedMetaAsset.minDailyBudgetMinor / 100,
        }
      : undefined;

  useEffect(() => {
    if (!editCampaignId) {
      setEditingCampaignLoading(false);
      return;
    }

    let active = true;
    setEditingCampaignLoading(true);
    setError(null);
    void fetchCampaignById(editCampaignId)
      .then((result) => {
        if (!active) return;
        const status = (result.status ?? "draft").toLowerCase();
        if (!["draft", "failed"].includes(status)) {
          throw new Error("Only draft or failed campaigns can be edited.");
        }
        const payload = campaignDtoToPayload(result);
        if (payload.creationMode === "unknown") {
          throw new Error("This campaign does not have a supported setup mode.");
        }
        setCampaign({ ...payload, creationMode: payload.creationMode });
        setMethod(payload.creationMode);
        setGoalConfirmed(true);
        setSavedCampaignId(result.id);
        setStep(5);
      })
      .catch((failure) => {
        if (!active) return;
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not load the campaign for editing.",
        );
      })
      .finally(() => {
        if (active) setEditingCampaignLoading(false);
      });

    return () => {
      active = false;
    };
  }, [editCampaignId]);

  useEffect(() => {
    let active = true;
    void hydrateSocialAccounts()
      .then((result) => {
        if (!active) return;
        if (result.success) setAccounts(result.data ?? {});
        else
          setAccountError(result.error ?? "Could not load connected accounts.");
      })
      .finally(() => {
        if (active) setAccountsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (aiSessionRestoredRef.current) return;
    aiSessionRestoredRef.current = true;
    if (editCampaignId) return;
    const saved = sessionStorage.getItem(AI_DRAFT_STORAGE_KEY);
    if (!saved) return;
    try {
      const value = JSON.parse(saved) as {
        campaign?: CreateCampaignPayload;
        draftId?: string;
        revision?: number;
        generatedDraft?: GeneratedCampaignDraft;
        question?: AiCampaignQuestion;
        rationale?: string;
        messages?: AiMessage[];
        stepRationales?: typeof EMPTY_AI_RATIONALES;
        statuses?: Record<AiCampaignStepId, AiStepStatus>;
        savedCampaignId?: string;
      };
      if (
        !value.campaign ||
        value.campaign.creationMode !== "ai" ||
        typeof value.savedCampaignId === "string" ||
        typeof value.draftId !== "string" ||
        typeof value.revision !== "number" ||
        (!value.generatedDraft && !value.question) ||
        (value.generatedDraft &&
          (!value.stepRationales ||
            !value.statuses ||
            AI_CAMPAIGN_STEP_IDS.some(
              (id) =>
                !["review", "approved", "revising"].includes(
                  value.statuses?.[id] as string,
                ),
            )))
      ) {
        sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
        return;
      }
      setCampaign(value.campaign);
      setMethod("ai");
      setGoalConfirmed(Boolean(value.generatedDraft));
      setAiDraftId(value.draftId);
      setAiDraftRevision(value.revision);
      setAiGeneratedDraft(value.generatedDraft ?? null);
      setAiQuestion(value.question ?? null);
      setAiRationale(
        value.rationale ?? value.generatedDraft?.rationale ?? null,
      );
      setAiMessages(value.messages ?? []);
      setSavedCampaignId(value.savedCampaignId ?? null);
      if (value.stepRationales) setAiStepRationales(value.stepRationales);
      if (value.statuses) aiFlow.restoreStatuses(value.statuses);
      setStep(0);
    } catch {
      sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
    }
  }, [aiFlow, editCampaignId]);

  useEffect(() => {
    if (!aiSessionRestoredRef.current) return;
    if (
      !aiDraftId ||
      (!aiGeneratedDraft && !aiQuestion) ||
      campaign.creationMode !== "ai"
    ) {
      sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      AI_DRAFT_STORAGE_KEY,
      JSON.stringify({
        campaign,
        draftId: aiDraftId,
        revision: aiDraftRevision,
        generatedDraft: aiGeneratedDraft
          ? campaignToAiDraft(campaign, aiGeneratedDraft)
          : undefined,
        question: aiQuestion ?? undefined,
        rationale: aiRationale,
        messages: aiMessages,
        stepRationales: aiStepRationales,
        statuses: aiFlow.statuses,
        savedCampaignId,
      }),
    );
  }, [
    aiDraftId,
    aiDraftRevision,
    aiFlow.statuses,
    aiGeneratedDraft,
    aiMessages,
    aiQuestion,
    aiRationale,
    aiStepRationales,
    campaign,
    savedCampaignId,
  ]);

  const patch = (next: Partial<CreateCampaignPayload>) =>
    setCampaign((current) => ({ ...current, ...next }));

  const patchCampaign = (next: Partial<CreateCampaignPayload["campaign"]>) =>
    setCampaign((current) => ({
      ...current,
      campaign: { ...current.campaign, ...next },
    }));

  const patchConfiguration = (next: Partial<CampaignConfiguration>) =>
    setCampaign((current) => ({
      ...current,
      campaign: {
        ...current.campaign,
        configuration: { ...current.campaign.configuration, ...next },
      },
    }));

  const patchAudience = (next: Partial<CreateCampaignPayload["audience"]>) => {
    if (campaign.creationMode === "ai") aiFlow.markReview("audience");
    setCampaign((current) => ({
      ...current,
      audience: { ...current.audience, ...next },
    }));
  };

  const patchBudget = (next: Partial<CreateCampaignPayload["budget"]>) => {
    if (campaign.creationMode === "ai") aiFlow.markReview("budget");
    setCampaign((current) => ({
      ...current,
      budget: { ...current.budget, ...next },
    }));
  };

  const setPlatformAccounts = (
    platforms: CampaignPlatform[],
    accountAssetIds: Partial<Record<CampaignPlatform, string>>,
  ) => {
    if (campaign.creationMode === "ai") {
      aiFlow.markReview("platform");
      aiFlow.markReview("event");
      aiFlow.markReview("creative");
    }
    setCampaign((current) => {
      for (const platform of current.campaign.platforms) {
        creativeCache.current.set(
          platform,
          current.adContent.creatives.filter(
            (creative) => creative.platform === platform,
          ),
        );
      }
      const tiktokSelected = platforms.includes("tiktok");
      const resetGoal =
        tiktokSelected && current.campaign.goal === "APP_PROMOTION";
      const resetDestination =
        tiktokSelected &&
        current.campaign.configuration.destination === "INSTANT_FORM";
      const goal = resetGoal ? "AWARENESS" : current.campaign.goal;
      const configuration = {
        ...current.campaign.configuration,
        accountAssetIds,
        eventSourceIds: Object.fromEntries(
          Object.entries(
            current.campaign.configuration.eventSourceIds ?? {},
          ).filter(([platform]) =>
            platforms.includes(platform as CampaignPlatform),
          ),
        ),
        specialAdCategories: platforms.includes("meta")
          ? current.campaign.configuration.specialAdCategories
          : [],
        ...(resetGoal || resetDestination
          ? {
              destination: "WEBSITE" as const,
              optimizationGoal: "REACH" as const,
            }
          : {}),
      };
      const selectedMetaAsset = accounts?.meta?.assets?.find(
        (asset) => asset.id === accountAssetIds.meta,
      );
      const budget =
        selectedMetaAsset?.readyForCampaigns &&
        selectedMetaAsset.currency &&
        typeof selectedMetaAsset.minDailyBudgetMinor === "number"
          ? {
              ...current.budget,
              currency: selectedMetaAsset.currency,
              amount: Math.max(
                current.budget.amount,
                selectedMetaAsset.minDailyBudgetMinor / 100,
              ),
            }
          : current.budget;
      return {
        ...current,
        campaign: { ...current.campaign, platforms, goal, configuration },
        budget,
        adContent: {
          creatives: platforms.flatMap((platform) => {
            const cached = creativeCache.current.get(platform);
            return cached?.length ? cached : [emptyCreative(platform)];
          }),
        },
      };
    });
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
        failure instanceof Error
          ? failure.message
          : `Could not connect ${platform}.`,
      );
    } finally {
      setConnecting(null);
    }
  };

  const refreshConnection = async (platform: CampaignPlatform) => {
    setConnecting(platform);
    setAccountError(null);
    try {
      const result = await refreshSocialAccount(platform);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? `Could not refresh ${platform}.`);
      }
      setAccounts(result.data);
    } catch (failure) {
      setAccountError(
        failure instanceof Error
          ? failure.message
          : `Could not refresh ${platform}.`,
      );
    } finally {
      setConnecting(null);
    }
  };

  const generateCampaignName = async () => {
    if (aiDisabledReason) {
      setError(aiDisabledReason);
      return;
    }
    if (generatingName) return;
    setGeneratingName(true);
    setError(null);
    try {
      const suggestion = await requestCampaignName({
        brandName,
        currentName: campaign.campaign.name.trim() || undefined,
        goal: campaign.campaign.goal,
        platforms: campaign.campaign.platforms,
      });
      if (campaign.creationMode === "ai") aiFlow.markReview("setup");
      patchCampaign({ name: suggestion.name });
      setNameRationale(suggestion.rationale);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not generate a campaign name.",
      );
    } finally {
      setGeneratingName(false);
    }
  };

  const beginAiRequest = (stepId?: AiStep["id"]) => {
    aiAbortRef.current?.abort();
    const controller = new AbortController();
    const requestId = aiRequestIdRef.current + 1;
    aiRequestIdRef.current = requestId;
    aiAbortRef.current = controller;
    if (stepId) aiFlow.markRevising(stepId);
    setAiLoading(true);
    setError(null);
    return { controller, requestId };
  };

  const applyAiResponse = (
    response: AiCampaignDraftResponse,
    options?: {
      requestId: number;
      lockedSteps?: AiCampaignStepId[];
      baseDraft?: GeneratedCampaignDraft;
      initial?: boolean;
      preserveStep?: boolean;
    },
  ) => {
    if (options && options.requestId !== aiRequestIdRef.current) return;
    if (response.status === "needs_input") {
      setAiDraftId(response.draftId);
      setAiDraftRevision(response.revision);
      setAiMessages(toUiMessages(response.messages));
      setAiQuestion(response.question);
      setStep(0);
      return;
    }
    if (response.status === "answer") {
      setAiDraftId(response.draftId);
      setAiDraftRevision(response.revision);
      const responseMessages = toUiMessages(response.messages);
      setAiMessages(
        responseMessages.some(
          (message) =>
            message.sender !== "user" && message.text === response.answer,
        )
          ? responseMessages
          : [
              ...responseMessages,
              {
                id: `answer-${response.revision}`,
                sender: "ai",
                text: response.answer,
              },
            ],
      );
      setAiQuestion(null);
      setStep(0);
      return;
    }

    const generated = response.draft;
    const lockedSteps = options?.lockedSteps ?? [];
    const baseDraft = options?.baseDraft ?? aiGeneratedDraft;
    if (baseDraft && lockedSteps.length) {
      const changedLockedStep = lockedSteps.find(
        (stepId) =>
          JSON.stringify(aiStepSnapshot(baseDraft, stepId)) !==
          JSON.stringify(aiStepSnapshot(generated, stepId)),
      );
      if (changedLockedStep) {
        throw new Error(
          `Growdex AI changed the approved ${changedLockedStep} decision. The revision was rejected and your current draft was kept.`,
        );
      }
    }

    for (const platform of generated.platforms) {
      const configuredId = generated.configuration.accountAssetIds?.[platform];
      const selectedAsset = accounts?.[platform]?.assets?.find(
        (asset) => asset.id === configuredId,
      );
      if (!configuredId || !selectedAsset) {
        throw new Error(
          `Growdex AI selected a ${platform === "meta" ? "Meta" : "TikTok"} account that is not available. Reconnect the account and try again.`,
        );
      }
      if (
        platform === "meta" &&
        "currency" in selectedAsset &&
        (generated.budget.currency !== selectedAsset.currency ||
          (generated.budget.type === "daily" &&
            typeof selectedAsset.minDailyBudgetMinor === "number" &&
            generated.budget.amount * 100 <
              selectedAsset.minDailyBudgetMinor))
      ) {
        throw new Error(
          "Growdex AI returned a budget that does not match the selected Meta account currency and minimum. The draft was rejected.",
        );
      }
    }

    setAiDraftId(response.draftId);
    setAiDraftRevision(response.revision);
    setAiMessages(toUiMessages(response.messages));

    const start = generated.budget.startDateLocal
      ? new Date(generated.budget.startDateLocal)
      : new Date(Date.now() + 30 * 60_000);
    const end = generated.budget.endDateLocal
      ? new Date(generated.budget.endDateLocal)
      : new Date(start);
    if (!generated.budget.endDateLocal) {
      end.setUTCDate(end.getUTCDate() + generated.budget.durationDays);
    }
    setCampaign({
      creationMode: "ai",
      campaign: {
        name: generated.name,
        goal: generated.goal,
        platforms: generated.platforms,
        configuration: {
          ...generated.configuration,
          sameCreativeForAll: false,
        },
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
        creatives: generated.creatives.map((creative) => ({
          platform: creative.platform,
          primaryText: creative.primaryText,
          headline: creative.headline,
          cta: creative.cta,
          mediaUrl: creative.mediaUrl,
          landingPageUrl: creative.landingPageUrl,
          appId: creative.appId,
          leadFormId: creative.leadFormId,
        })),
      },
    });
    setAiGeneratedDraft(generated);
    setGoalConfirmed(true);
    setAiRationale(generated.rationale);
    setAiStepRationales(generated.stepRationales);
    setAiQuestion(null);
    if (options?.initial) aiFlow.resetReviews();
    else aiFlow.applyRevision(response.changedSteps);
    if (!options?.preserveStep) setStep(0);
  };

  const startAiDraft = async (prompt: string) => {
    if (aiDisabledReason) {
      setError(aiDisabledReason);
      return;
    }
    if (accountsLoading) {
      setError("Wait while Growdex checks your connected ad accounts.");
      return;
    }
    if (
      !accounts ||
      (!connected(accounts, "meta") && !connected(accounts, "tiktok"))
    ) {
      setError(
        "Connect at least one ad account before creating a campaign with AI.",
      );
      return;
    }
    setAiMessages([{ id: `user-${Date.now()}`, sender: "user", text: prompt }]);
    const { controller, requestId } = beginAiRequest();
    try {
      const response = await startAiCampaignDraft({
        prompt,
        brandName,
        currency: campaign.budget.currency,
        signal: controller.signal,
      });
      applyAiResponse(response, { requestId, initial: true });
    } catch (failure) {
      if (requestId !== aiRequestIdRef.current || controller.signal.aborted)
        return;
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not start the AI campaign draft.",
      );
    } finally {
      if (requestId === aiRequestIdRef.current) setAiLoading(false);
    }
  };

  const reviseAiDraft = async (
    instruction: string,
    options?: {
      stepId?: AiStep["id"];
      userText?: string;
      lockedSteps?: AiCampaignStepId[];
      preserveStep?: boolean;
    },
  ) => {
    if (!aiDraftId || !aiGeneratedDraft) {
      setError("The AI draft session is missing. Start a new AI campaign.");
      return;
    }
    const userText = options?.userText ?? instruction;
    const requestMessages = [
      ...aiMessages.map((message) => ({
        role:
          message.sender === "user"
            ? ("user" as const)
            : ("assistant" as const),
        content: message.text,
      })),
      { role: "user" as const, content: userText },
    ];
    setAiMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, sender: "user", text: userText },
    ]);
    const lockedSteps = options?.lockedSteps ?? aiFlow.approvedStepIds;
    const currentDraft = campaignToAiDraft(campaign, aiGeneratedDraft);
    const { controller, requestId } = beginAiRequest(options?.stepId);
    try {
      const response = await reviseAiCampaignDraft({
        draftId: aiDraftId,
        revision: aiDraftRevision,
        currentDraft,
        targetStep: options?.stepId,
        instruction,
        lockedSteps,
        messages: requestMessages,
        signal: controller.signal,
      });
      applyAiResponse(response, {
        requestId,
        lockedSteps,
        baseDraft: currentDraft,
        preserveStep: options?.preserveStep,
      });
    } catch (failure) {
      if (requestId !== aiRequestIdRef.current || controller.signal.aborted)
        return;
      if (options?.stepId) aiFlow.markReview(options.stepId);
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not revise the AI campaign draft.",
      );
    } finally {
      if (requestId === aiRequestIdRef.current) setAiLoading(false);
    }
  };

  const fixAllAudienceIssuesWithAi = async () => {
    if (!aiDraftId || !aiGeneratedDraft || campaign.creationMode !== "ai") {
      throw new Error(
        "AI audience fixes are available after Growdex AI creates the campaign draft.",
      );
    }
    await reviseAiDraft(
      "Resolve every audience-readiness issue while keeping the campaign goal, platforms, destination, budget, creative, and account choices unchanged. Broaden targeting only as much as needed to make the audience viable.",
      {
        stepId: "audience",
        userText: "Fix all audience readiness issues with AI",
        lockedSteps: AI_CAMPAIGN_STEP_IDS.filter(
          (stepId) => stepId !== "audience",
        ),
        preserveStep: true,
      },
    );
  };

  const answerAiQuestion = async (optionIds: string[]) => {
    if (!aiDraftId || !aiQuestion) return;
    const { controller, requestId } = beginAiRequest();
    try {
      const response = await answerAiCampaignQuestion({
        draftId: aiDraftId,
        revision: aiDraftRevision,
        questionId: aiQuestion.id,
        optionIds,
        signal: controller.signal,
      });
      applyAiResponse(response, { requestId, initial: !aiGeneratedDraft });
    } catch (failure) {
      if (requestId !== aiRequestIdRef.current || controller.signal.aborted)
        return;
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not continue the AI campaign draft.",
      );
    } finally {
      if (requestId === aiRequestIdRef.current) setAiLoading(false);
    }
  };

  const patchCreative = (
    index: number,
    next: Partial<CampaignCreativeInput>,
  ) => {
    if (campaign.creationMode === "ai") aiFlow.markReview("creative");
    setCampaign((current) => {
      const existing = current.adContent.creatives[index];
      if (!existing) return current;
      const shared = current.campaign.configuration.sameCreativeForAll;
      const sharedFields: Partial<CampaignCreativeInput> = {};
      if (shared && next.primaryText !== undefined) {
        sharedFields.primaryText = next.primaryText;
      }
      if (shared && next.headline !== undefined) {
        sharedFields.headline = next.headline;
      }
      if (shared && next.cta !== undefined) sharedFields.cta = next.cta;
      const creatives = current.adContent.creatives.map(
        (creative, creativeIndex) => ({
          ...creative,
          ...(creativeIndex === index ? next : sharedFields),
        }),
      );
      for (const platform of current.campaign.platforms) {
        creativeCache.current.set(
          platform,
          creatives.filter((creative) => creative.platform === platform),
        );
      }
      return { ...current, adContent: { creatives } };
    });
  };

  const replaceCreatives = (creatives: CampaignCreativeInput[]) => {
    if (campaign.creationMode === "ai") aiFlow.markReview("creative");
    for (const platform of campaign.campaign.platforms) {
      creativeCache.current.set(
        platform,
        creatives.filter((creative) => creative.platform === platform),
      );
    }
    setCampaign((current) => ({
      ...current,
      adContent: { creatives },
    }));
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
        body: JSON.stringify({
          public_id: publicId,
          folder: CLOUDINARY_FOLDER,
        }),
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
      setError(
        failure instanceof Error ? failure.message : "Media upload failed.",
      );
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
    if (step === 0 && !method) {
      setError("Choose how you want to create your campaign.");
      return;
    }
    if (step === 0 && !campaign.campaign.name.trim()) {
      setError("Enter a campaign name.");
      return;
    }
    if (
      step === 1 &&
      (!campaign.campaign.platforms.length ||
        campaign.campaign.platforms.some(
          (platform) =>
            !campaign.campaign.configuration.accountAssetIds?.[platform],
        ))
    ) {
      setError("Choose an ad account for every selected platform.");
      return;
    }
    if (step === 2 && !goalConfirmed) {
      setError("Choose a campaign goal before continuing.");
      return;
    }
    if (
      step === 3 &&
      campaign.campaign.configuration.optimizationGoal === "CONVERSIONS" &&
      campaign.campaign.platforms.some(
        (platform) =>
          !campaign.campaign.configuration.eventSourceIds?.[platform],
      )
    ) {
      setError("Choose a conversion event source for every selected platform.");
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
    const validation = validateCampaignDraftPayload(campaign);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = savedCampaignId
        ? await updateCampaign(savedCampaignId, campaign)
        : await createCampaign(campaign, {
            idempotencyKey: createIdempotencyKeyRef.current,
          });
      setSavedCampaignId(created.id);
      setCompletion({ kind: "draft", campaignId: created.id });
      sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
      setSaving(false);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save the campaign.",
      );
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
      const saved = savedCampaignId
        ? await updateCampaign(savedCampaignId, campaign)
        : await createCampaign(campaign, {
            idempotencyKey: createIdempotencyKeyRef.current,
          });
      setSavedCampaignId(saved.id);
      const fingerprint = JSON.stringify(campaign);
      if (
        !publishAttemptRef.current ||
        publishAttemptRef.current.campaignId !== saved.id ||
        publishAttemptRef.current.fingerprint !== fingerprint
      ) {
        publishAttemptRef.current = {
          campaignId: saved.id,
          fingerprint,
          key: crypto.randomUUID(),
        };
      }
      await publishCampaign(saved.id, {
        idempotencyKey: publishAttemptRef.current.key,
      });
      setCompletion({ kind: "publish", campaignId: saved.id });
      sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
      setPublishing(false);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not publish the campaign.",
      );
      setPublishing(false);
    }
  };

  const updateCampaignGoal = (
    goal: CreateCampaignPayload["campaign"]["goal"],
    next: Pick<
      CampaignConfiguration,
      "destination" | "optimizationGoal"
    >,
  ) => {
    if (campaign.creationMode === "ai") {
      aiFlow.markReview("goals");
      aiFlow.markReview("event");
    }
    patchCampaign({
      goal,
      configuration: {
        ...campaign.campaign.configuration,
        ...next,
        eventSourceIds: {},
      },
    });
    setError(null);
  };

  const updateSpecialAdCategories = (
    specialAdCategories: MetaSpecialAdCategory[],
  ) => {
    if (campaign.creationMode === "ai") {
      aiFlow.markReview("goals");
      aiFlow.markReview("audience");
    }
    patchConfiguration({ specialAdCategories });
    if (hasRestrictedMetaTargeting(specialAdCategories)) {
      patchAudience({
        ageMin: 18,
        ageMax: 65,
        gender: "all",
        interests: [],
      });
    }
    setError(null);
  };

  const updateEventManagement = (
    next: Partial<CampaignConfiguration>,
  ) => {
    if (campaign.creationMode === "ai") aiFlow.markReview("event");
    patchConfiguration({
      ...next,
      ...(next.optimizationGoal !== "CONVERSIONS"
        ? { eventSourceIds: {} }
        : {}),
    });
    setError(null);
  };

  const renderAiInlineEditor = (reviewStep: AiStep) => {
    switch (reviewStep.id) {
      case "setup":
        return (
          <CampaignNameCard
            value={campaign.campaign.name}
            onChange={(name) => {
              patchCampaign({ name });
              setNameRationale(null);
            }}
            onGenerate={() => void generateCampaignName()}
            generating={generatingName}
            rationale={nameRationale}
            disabledReason={aiDisabledReason}
          />
        );
      case "platform":
        return (
          <div>
            <ManualPlatformScreen
              accounts={accounts}
              loading={accountsLoading}
              connecting={connecting}
              platforms={campaign.campaign.platforms}
              accountAssetIds={
                campaign.campaign.configuration.accountAssetIds ?? {}
              }
              onChange={setPlatformAccounts}
              onConnect={(platform) => void connect(platform)}
              onRefresh={(platform) => void refreshConnection(platform)}
            />
            {accountError && (
              <p className="mt-3 text-sm text-red-600">{accountError}</p>
            )}
          </div>
        );
      case "goals":
        return (
          <ManualGoalScreen
            goal={campaign.campaign.goal}
            platforms={campaign.campaign.platforms}
            specialAdCategories={
              campaign.campaign.configuration.specialAdCategories
            }
            onChange={updateCampaignGoal}
            onSpecialAdCategoriesChange={updateSpecialAdCategories}
            onConfirmedChange={setGoalConfirmed}
          />
        );
      case "event":
        return (
          <div className="space-y-4">
            <ManualEventManagementScreen
              goal={campaign.campaign.goal}
              platforms={campaign.campaign.platforms}
              configuration={campaign.campaign.configuration}
              onChange={updateEventManagement}
            />
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="font-semibold text-gray-900">
                Conversion data source
              </h4>
              <div className="mt-4">
                <ManualEventScreen
                  platforms={campaign.campaign.platforms}
                  accountAssetIds={
                    campaign.campaign.configuration.accountAssetIds ?? {}
                  }
                  eventSourceIds={
                    campaign.campaign.configuration.eventSourceIds ?? {}
                  }
                  optimizationGoal={
                    campaign.campaign.configuration.optimizationGoal
                  }
                  onChange={(eventSourceIds) => {
                    aiFlow.markReview("event");
                    patchConfiguration({ eventSourceIds });
                  }}
                />
              </div>
            </section>
          </div>
        );
      case "audience":
        return (
          <AudienceTargetingScreen
            goal={campaign.campaign.goal}
            platforms={campaign.campaign.platforms}
            configuration={campaign.campaign.configuration}
            audience={campaign.audience}
            accounts={accounts}
            unavailableInterests={unavailableInterests}
            onChange={patchAudience}
            onReplaceInterest={replaceUnavailableInterest}
            onClearUnavailableInterests={() => setUnavailableInterests({})}
            onFixAllWithAi={
              campaign.creationMode === "ai" &&
              aiDraftId &&
              aiGeneratedDraft
                ? fixAllAudienceIssuesWithAi
                : undefined
            }
          />
        );
      case "budget":
        return (
          <CampaignBudgetEditor
            budget={campaign.budget}
            onChange={patchBudget}
            accountRules={selectedMetaAccountRules}
          />
        );
      case "creative":
        return (
          <CreativeSetupScreen
            goal={campaign.campaign.goal}
            destination={campaign.campaign.configuration.destination}
            accounts={accounts}
            accountsLoading={accountsLoading}
            connecting={connecting}
            connectionError={accountError}
            onConnect={(platform) => void connect(platform)}
            metaAssetId={
              campaign.campaign.configuration.accountAssetIds?.meta
            }
            platforms={campaign.campaign.platforms}
            creatives={campaign.adContent.creatives}
            ctaOptions={CTA_OPTIONS}
            uploading={uploading}
            sameCreativeForAll={
              campaign.campaign.configuration.sameCreativeForAll
            }
            onSameCreativeForAllChange={(sameCreativeForAll) =>
              patchConfiguration({ sameCreativeForAll })
            }
            onChange={patchCreative}
            onReplace={replaceCreatives}
            onUpload={(index, platform, file) =>
              void uploadMedia(index, platform, file)
            }
          />
        );
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

  const nav = step < STEPS.length - 1 &&
    (step > 0 || method === "manual") && (
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
        {checkingInterests ? "Checking interests…" : "Continue"}{" "}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <PanelLayout defaultSidebarCollapsed>
      <div className="relative flex h-full">
        <DottedBackground fade />
        <div className="relative z-10 flex h-full w-full">
          {editingCampaignLoading ? (
            <main className="h-full flex-1 overflow-y-auto">
              <div className="mx-auto max-w-5xl p-4 md:p-8">
                <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
                  Loading the campaign editor…
                </p>
              </div>
            </main>
          ) : method === "ai" && step === 0 ? (
            <>
              <CampaignTreeSidebar
                campaignName={campaign.campaign.name || "Untitled campaign"}
                campaign={campaign}
                compact
              />
              <AiCampaignWorkspace
                campaignName={campaign.campaign.name}
                firstName={firstName}
                steps={aiGeneratedDraft ? aiFlow.steps : undefined}
                messages={aiMessages}
                question={aiQuestion}
                loading={aiLoading}
                allApproved={aiFlow.allApproved}
                error={error}
                readinessNotice={aiReadinessNotice}
                disabledReason={aiDisabledReason}
                generatingName={generatingName}
                nameRationale={nameRationale}
                onCampaignNameChange={(name) => {
                  if (aiGeneratedDraft) aiFlow.markReview("setup");
                  patchCampaign({ name });
                  setNameRationale(null);
                }}
                onGenerateName={() => void generateCampaignName()}
                onApprove={aiFlow.approve}
                onApproveAll={aiFlow.approveAll}
                onAnswer={(optionIds) => void answerAiQuestion(optionIds)}
                onWhyThis={(reviewStep) =>
                  setAiMessages((current) => [
                    ...current,
                    {
                      id: `why-user-${reviewStep.id}-${Date.now()}`,
                      sender: "user",
                      text: `Why did you choose ${reviewStep.title.toLowerCase()}?`,
                    },
                    {
                      id: `why-ai-${reviewStep.id}-${Date.now()}`,
                      text: reviewStep.reason,
                    },
                  ])
                }
                onEdit={(reviewStep) => {
                  aiFlow.markReview(reviewStep.id);
                }}
                renderInlineEditor={renderAiInlineEditor}
                onDecline={(reviewStep, instruction) =>
                  void reviseAiDraft(instruction, {
                    stepId: reviewStep.id,
                    userText: instruction,
                  })
                }
                onPrompt={(prompt) =>
                  void (aiDraftId
                    ? reviseAiDraft(prompt)
                    : startAiDraft(prompt))
                }
                continueLabel={aiPostReviewLabel}
                onContinue={() => {
                  setStep(aiPostReviewStep);
                }}
              />
            </>
          ) : (
            <>
              <CampaignTreeSidebar
                campaignName={campaign.campaign.name || "Untitled campaign"}
                campaign={campaign}
              />
              <main className="h-full flex-1 overflow-y-auto">
                <div className="mx-auto max-w-5xl p-4 md:p-8">
                  <div className="mb-8">{stepper}</div>

                  {aiRationale && step > 0 && step < 6 && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="flex-1">
                        <p>
                          <span className="font-semibold">AI draft:</span>{" "}
                          {aiRationale} Review every choice before publishing.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(0);
                          }}
                          className="mt-2 text-xs font-semibold text-violet-700 underline"
                        >
                          Return to AI decision review
                        </button>
                      </div>
                    </div>
                  )}

                  {error && step < 6 && (
                    <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  {step === 0 && (
                    <div className="space-y-6">
                      {method === "manual" ? (
                        <CampaignNameCard
                          value={campaign.campaign.name}
                          onChange={(name) => {
                            patchCampaign({ name });
                            setNameRationale(null);
                          }}
                          onGenerate={() => void generateCampaignName()}
                          generating={generatingName}
                          rationale={nameRationale}
                          disabledReason={aiDisabledReason}
                          prominent
                        />
                      ) : (
                        <CreateMethodBox
                          value={method}
                          onSelect={(nextMethod) => {
                            setMethod(nextMethod);
                            patch({ creationMode: nextMethod });
                            setError(null);
                            if (nextMethod === "manual") {
                              setGoalConfirmed(true);
                            }
                          }}
                        />
                      )}
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <ManualPlatformScreen
                        accounts={accounts}
                        loading={accountsLoading}
                        connecting={connecting}
                        platforms={campaign.campaign.platforms}
                        accountAssetIds={
                          campaign.campaign.configuration.accountAssetIds ?? {}
                        }
                        onChange={setPlatformAccounts}
                        onConnect={(platform) => void connect(platform)}
                        onRefresh={(platform) =>
                          void refreshConnection(platform)
                        }
                      />
                      {accountError && (
                        <p className="mt-4 text-sm text-red-600">
                          {accountError}
                        </p>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <ManualGoalScreen
                      goal={campaign.campaign.goal}
                      platforms={campaign.campaign.platforms}
                      specialAdCategories={
                        campaign.campaign.configuration.specialAdCategories
                      }
                      onChange={updateCampaignGoal}
                      onSpecialAdCategoriesChange={
                        updateSpecialAdCategories
                      }
                      onConfirmedChange={setGoalConfirmed}
                    />
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <ManualEventManagementScreen
                        goal={campaign.campaign.goal}
                        platforms={campaign.campaign.platforms}
                        configuration={campaign.campaign.configuration}
                        onChange={updateEventManagement}
                      />

                      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-xl font-gilroy-semibold text-gray-900">
                          Setup event management for your ad
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                          Connect the platform data source used to measure the
                          result you selected.
                        </p>
                        <div className="mt-5">
                          <ManualEventScreen
                            platforms={campaign.campaign.platforms}
                            accountAssetIds={
                              campaign.campaign.configuration.accountAssetIds ??
                              {}
                            }
                            eventSourceIds={
                              campaign.campaign.configuration.eventSourceIds ??
                              {}
                            }
                            optimizationGoal={
                              campaign.campaign.configuration.optimizationGoal
                            }
                            onChange={(eventSourceIds) => {
                              if (campaign.creationMode === "ai")
                                aiFlow.markReview("event");
                              patchConfiguration({ eventSourceIds });
                            }}
                          />
                        </div>
                      </section>

                      <div>
                        <div className="mb-4">
                          <h2 className="text-xl font-gilroy-semibold text-gray-900">
                            Find your audience
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            Define who should see this campaign across the
                            selected platforms.
                          </p>
                        </div>
                        <AudienceTargetingScreen
                          goal={campaign.campaign.goal}
                          platforms={campaign.campaign.platforms}
                          configuration={campaign.campaign.configuration}
                          audience={campaign.audience}
                          accounts={accounts}
                          unavailableInterests={unavailableInterests}
                          onChange={patchAudience}
                          onReplaceInterest={replaceUnavailableInterest}
                          onClearUnavailableInterests={() =>
                            setUnavailableInterests({})
                          }
                          onFixAllWithAi={
                            campaign.creationMode === "ai" &&
                            aiDraftId &&
                            aiGeneratedDraft
                              ? fixAllAudienceIssuesWithAi
                              : undefined
                          }
                        />
                      </div>
                      {accountError && (
                        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                          {accountError}
                        </p>
                      )}
                    </div>
                  )}

                  {step === 4 && (
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                      <CampaignBudgetEditor
                        budget={campaign.budget}
                        onChange={patchBudget}
                        accountRules={selectedMetaAccountRules}
                      />
                    </section>
                  )}

                  {step === 5 && (
                    <CreativeSetupScreen
                      goal={campaign.campaign.goal}
                      destination={campaign.campaign.configuration.destination}
                      accounts={accounts}
                      accountsLoading={accountsLoading}
                      connecting={connecting}
                      connectionError={accountError}
                      onConnect={(platform) => void connect(platform)}
                      metaAssetId={
                        campaign.campaign.configuration.accountAssetIds?.meta
                      }
                      platforms={campaign.campaign.platforms}
                      creatives={campaign.adContent.creatives}
                      ctaOptions={CTA_OPTIONS}
                      uploading={uploading}
                      sameCreativeForAll={
                        campaign.campaign.configuration.sameCreativeForAll
                      }
                      onSameCreativeForAllChange={(sameCreativeForAll) =>
                        patchConfiguration({ sameCreativeForAll })
                      }
                      onChange={patchCreative}
                      onReplace={replaceCreatives}
                      onUpload={(index, platform, file) =>
                        void uploadMedia(index, platform, file)
                      }
                    />
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
            </>
          )}
        </div>
        <AdCreatedModal
          open={completion !== null}
          kind={completion?.kind ?? "draft"}
          navigating={saving || publishing}
          onPrimary={() => {
            if (!completion) return;
            sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
            if (completion.kind === "publish") {
              setPublishing(true);
              router.push("/panel/campaigns");
            } else {
              setSaving(true);
              router.push(
                `/panel/campaigns/new/publish?id=${encodeURIComponent(completion.campaignId)}`,
              );
            }
          }}
          onCampaigns={() => {
            sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
            setSaving(true);
            router.push("/panel/campaigns");
          }}
        />
      </div>
    </PanelLayout>
  );
}
