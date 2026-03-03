"use client";

// TODO: This file is getting quite large. Consider splitting into multiple components or at least moving helper functions to a separate module. Or maybe just refactor the whole thing to use a single component with conditional rendering instead of a "progressTab" state.

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLayout } from "../../../components/panel-layout";
import { CampaignsSidebar } from "../../../components/campaigns-sidebar";
import {
  ChevronDown,
  CircleArrowRight,
  Facebook,
  InstagramIcon,
  MoreVerticalIcon,
  Search,
  SparklesIcon,
  Users,
  UploadCloud,
} from "lucide-react";
import { PluggedIcon, PluggedOutIcon } from "@/components/svg";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/auth";
import {
  createCampaign,
  publishCampaign,
  type BudgetType,
  type CampaignGoal,
  type CreateCampaignPayload,
} from "@/lib/campaigns";
import { createAudience, fetchAudiences, type Audience } from "@/lib/audiences";
import { hydrateSocialAccounts } from "@/lib/social";
import {
  metaSpecialAdLocations,
  type MetaSpecialAdLocationCode,
} from "@/lib/meta-special-ad-locations";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/context/me-context";
import {
  CreativeDraft,
  FormObject,
  validateFile,
  toDateInputValue,
  isVideoUrl,
} from "@/lib/campaign-shared";
import { useCampaignFormState } from "@/lib/use-campaign-form";
import { GoalSection } from "../../components/GoalSection";
import { PlatformSection } from "../../components/PlatformSection";
import { AudienceSection } from "../../components/AudienceSection";
import { BudgetSection } from "../../components/BudgetSection";
import { CreativeSection } from "../../components/CreativeSection";

export default function PublishCampaignPage() {
  const router = useRouter();
  const { me } = useMe();
  const brandName = me?.brand?.name ?? "Your Brand";
  const instagramAccountName = (() => {
    const url = me?.brand?.instagramUrl;
    if (!url) return brandName.replace(/\s+/g, "_");
    const last = url.split("/").filter(Boolean).pop();
    if (!last) return brandName.replace(/\s+/g, "_");
    return last.startsWith("@") ? last.slice(1) : last;
  })();

  const {
    progressTab,
    setProgressTab,
    isLoading,
    setIsLoading,
    selectedPlatforms,
    setSelectedPlatforms,
    campaignName,
    setCampaignName,
    campaignGoal,
    setCampaignGoal,
    metaCountries,
    setMetaCountries,
    tiktokCountries,
    setTiktokCountries,
    metaLocationQuery,
    setMetaLocationQuery,
    tiktokLocationQuery,
    setTiktokLocationQuery,
    metaLocations,
    setMetaLocations,
    tiktokLocations,
    setTiktokLocations,
    metaInterestQuery,
    setMetaInterestQuery,
    tiktokInterestQuery,
    setTiktokInterestQuery,
    metaInterests,
    setMetaInterests,
    tiktokInterests,
    setTiktokInterests,
    totalReach,
    setTotalReach,
    metaAgeMin,
    setMetaAgeMin,
    metaAgeMax,
    setMetaAgeMax,
    currency,
    setCurrency,
    unifiedBudgetAmount,
    setUnifiedBudgetAmount,
    unifiedBudgetFrequency,
    setUnifiedBudgetFrequency,
    useSeparateBudgets,
    setUseSeparateBudgets,
    useSchedule,
    setUseSchedule,
    scheduleStartDate,
    setScheduleStartDate,
    scheduleEndDate,
    setScheduleEndDate,
    scheduleTime,
    setScheduleTime,
    metaBudgetAmount,
    setMetaBudgetAmount,
    tiktokBudgetAmount,
    setTiktokBudgetAmount,
    metaBudgetFrequency,
    setMetaBudgetFrequency,
    tiktokBudgetFrequency,
    setTiktokBudgetFrequency,
    isPublishing,
    setIsPublishing,
    submissionError,
    setSubmissionError,
    creativesByPlatform,
    setCreativesByPlatform,
    savedAudiences,
    setSavedAudiences,
    loadingAudiences,
    setLoadingAudiences,
    isCreativeModalOpen,
    setIsCreativeModalOpen,
    creativeType,
    setCreativeType,
    creativeHeading,
    setCreativeHeading,
    creativeSubheading,
    setCreativeSubheading,
    creativeImage,
    setCreativeImage,
    creativePreview,
    setCreativePreview,
    fileInputRef,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    uploadError,
    setUploadError,
  } = useCampaignFormState();

  // Load campaign data from session storage
  useEffect(() => {
    try {
      setIsLoading(true);

      const campaignData = sessionStorage.getItem("pendingCampaign");
      if (!campaignData) {
        // No pending campaign — redirect back to new campaign flow.
        setIsLoading(false);
        router.replace("/panel/campaigns/new");
        return;
      }

      const data = JSON.parse(campaignData);

      setCampaignName(data.name || "");
      setCampaignGoal(data.goal || "AWARENESS");

      const platforms = data.platforms || [];
      setSelectedPlatforms({
        meta: platforms.includes("meta"),
        tiktok: platforms.includes("tiktok"),
      });

      if (data.targeting) {
        const targeting = data.targeting;

        if (targeting.locations && targeting.locations.length > 0) {
          setMetaCountries(targeting.locations as MetaSpecialAdLocationCode[]);
          setTiktokCountries(
            targeting.locations as MetaSpecialAdLocationCode[],
          );
        }

        if (targeting.interests && targeting.interests.length > 0) {
          setMetaInterests(targeting.interests);
          setTiktokInterests(targeting.interests);
        }

        if (targeting.ageMin) setMetaAgeMin(String(targeting.ageMin));
        if (targeting.ageMax) setMetaAgeMax(String(targeting.ageMax));
      }

      // Load creatives if present in pendingCampaign
      if (data.creatives) {
        try {
          setCreativesByPlatform(
            data.creatives as Partial<Record<"meta" | "tiktok", any>>,
          );
        } catch (err) {
          // ignore if shape mismatches
        }
      }

      if (data.totalReach) {
        setTotalReach(data.totalReach);
      }

      if (data.budget) {
        const budget = data.budget;
        setCurrency(budget.currency || "NGN");

        if (budget.type === "daily" || budget.type === "lifetime") {
          setUnifiedBudgetFrequency(budget.type);
        }

        setUnifiedBudgetAmount(String(budget.amount || ""));

        if (budget.startDate && budget.endDate) {
          setUseSchedule(true);
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);

          setScheduleStartDate(toDateInputValue(startDate));
          setScheduleEndDate(toDateInputValue(endDate));
          setScheduleTime("09:00");
        }
      }
    } catch (err) {
      console.error("Failed to load campaign data:", err);
      setSubmissionError("Failed to load campaign data");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Helper functions (imported from shared module)

  const normalizeGoal = (goal: unknown): CampaignGoal => {
    const g = String(goal ?? "").toLowerCase();
    switch (g) {
      case "awareness":
        return "AWARENESS";
      case "traffic":
        return "TRAFFIC";
      case "conversions":
        return "ENGAGEMENT";
      case "sales":
        return "SALES";
      case "leads":
        return "LEADS";
      default:
        return "AWARENESS";
    }
  };

  const startOfUtcDayIso = (d: Date) =>
    new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    ).toISOString();

  const addDaysUtcIso = (iso: string, days: number) => {
    const base = new Date(iso);
    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString();
  };

  // media URL helpers (imported)

  const combineLocalDateAndTimeToIso = (
    dateValue: string,
    timeValue?: string,
  ) => {
    const time =
      typeof timeValue === "string" && /^\d{2}:\d{2}$/.test(timeValue)
        ? timeValue
        : "00:00";
    const dt = new Date(`${dateValue}T${time}:00`);
    return dt.toISOString();
  };

  const handlePublishCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);

    try {
      setIsPublishing(true);

      const defaultStartDate = startOfUtcDayIso(new Date());
      const defaultEndDate = addDaysUtcIso(defaultStartDate, 7);

      let startDate = defaultStartDate;
      let endDate = defaultEndDate;

      if (useSchedule) {
        const scheduledStart = combineLocalDateAndTimeToIso(
          scheduleStartDate,
          scheduleTime,
        );
        const scheduledEnd = combineLocalDateAndTimeToIso(
          scheduleEndDate,
          scheduleTime,
        );

        if (
          new Date(scheduledEnd).getTime() < new Date(scheduledStart).getTime()
        ) {
          setSubmissionError(
            "End date must be the same as or after start date.",
          );
          return;
        }

        startDate = scheduledStart;
        endDate = scheduledEnd;
      }

      const platforms = Object.entries(selectedPlatforms)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([platform]) => platform);

      if (platforms.length === 0) {
        setSubmissionError("Please choose at least one platform.");
        return;
      }

      const creatives = (
        Object.entries(creativesByPlatform) as Array<
          ["meta" | "tiktok", CreativeDraft | undefined]
        >
      )
        .filter(([platform, c]) => Boolean(c) && selectedPlatforms[platform])
        .map(([, c]) => ({
          primaryText: String(c?.primaryText ?? c?.subheading ?? ""),
          headline: String(c?.headline ?? c?.heading ?? ""),
          cta: String(c?.cta ?? "LEARN_MORE"),
          mediaUrl: String(c?.mediaUrl ?? c?.imageUrl ?? ""),
        }))
        .filter((c) => Boolean(c.mediaUrl));

      const payload: CreateCampaignPayload = {
        name: campaignName,
        goal: normalizeGoal(campaignGoal),
        platforms: platforms as Array<"meta" | "tiktok">,
        targeting: {
          locations: Array.from(
            new Set([
              ...(selectedPlatforms.meta ? metaCountries : []),
              ...(selectedPlatforms.tiktok ? tiktokCountries : []),
            ]),
          ),
          ageMin: Number(metaAgeMin) || 18,
          ageMax: Number(metaAgeMax) || 65,
          gender: "all" as const,
          interests: Array.from(
            new Set([
              ...(selectedPlatforms.meta ? metaInterests : []),
              ...(selectedPlatforms.tiktok ? tiktokInterests : []),
            ]),
          ),
        },
        budget: {
          amount: Number(unifiedBudgetAmount || 0),
          currency,
          type: unifiedBudgetFrequency,
          startDate,
          endDate,
        },
        creatives,
      };

      console.log("Publish Campaign payload:", payload);

      const result = await createCampaign(payload);
      console.log("Campaign created:", result);

      // result.id is expected from createCampaign
      if (result?.id) {
        console.log("Publishing campaign ID:", result.id);
        await publishCampaign(result.id);
        console.log("Campaign published successfully");
      } else {
        console.warn(
          "No ID returned from createCampaign, skipping publish call",
        );
      }

      // Clear session storage after successful creation
      sessionStorage.removeItem("pendingCampaign");

      // Redirect to campaigns page
      window.location.href = "/panel/campaigns";
    } catch (err) {
      console.error("Publish error:", err);
      setSubmissionError(
        err instanceof Error ? err.message : "Failed to publish campaign",
      );
      setIsPublishing(false);
    }
  };

  const progressTitles = [
    "Set campaign goal",
    "Choose platform",
    "Target audience",
    "Budget and schedule",
    "Creative setup",
  ];

  if (isLoading) {
    return (
      <PanelLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Loading campaign...</p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <div className="flex h-full">
        <CampaignsSidebar />

        <div className="h-full flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Review Campaign
              </h1>
            </div>

            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 mt-1 p-4">
              {progressTitles.map((title, index) => (
                <button
                  key={index}
                  onClick={() => setProgressTab(index)}
                  className={`px-2 py-3 rounded-lg font-medium transition-colors ${
                    progressTab === index
                      ? "bg-khaki-200 text-gray-900 shadow-lg"
                      : "bg-transparent text-gray-600"
                  } whitespace-nowrap`}
                >
                  {title}
                </button>
              ))}
            </div>

            <form className="space-y-6" onSubmit={handlePublishCampaign}>
              {/* Campaign Name & Action Header */}
              <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img src="/megaphone.png" alt="megaphone-icon" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      maxLength={100}
                      className="mt-1 block w-full focus:border-b focus:border-khaki-200 focus:outline-none md:text-lg lg:text-2xl"
                      readOnly
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-2 border bg-khaki-200 text-sm text-gray-800 rounded-lg font-bold flex items-center gap-2 hover:bg-khaki-300 transition-colors shadow-sm"
                >
                  {isPublishing ? "Publishing..." : "Publish"}
                </button>
              </div>

              {/* Goal Section */}
              <GoalSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                campaignGoal={campaignGoal as CampaignGoal}
                setCampaignGoal={setCampaignGoal}
                readOnly={true}
              />

              {/* Platform Section */}
              <PlatformSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                setSelectedPlatforms={setSelectedPlatforms}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
                readOnly={true}
              />

              {/* Audience Section */}
              <AudienceSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
                loadingAudiences={loadingAudiences}
                savedAudiences={savedAudiences}
                applyAudienceToForm={() => {}} // Disabled in review
                formatCountriesSummary={(codes) => codes.join(", ")}
                COUNTRY_OPTIONS={[]} // Not needed in readOnly
                metaCountries={metaCountries}
                tiktokCountries={tiktokCountries}
                toggleCountry={() => {}}
                metaLocationQuery=""
                setMetaLocationQuery={() => {}}
                tiktokLocationQuery=""
                setTiktokLocationQuery={() => {}}
                addLocationTag={() => {}}
                metaLocations={metaLocations}
                removeLocationTag={() => {}}
                tiktokLocations={tiktokLocations}
                metaAgeMin={metaAgeMin}
                setMetaAgeMin={() => {}}
                metaAgeMax={metaAgeMax}
                setMetaAgeMax={() => {}}
                metaInterestQuery=""
                setMetaInterestQuery={() => {}}
                addInterestTag={() => {}}
                metaInterests={metaInterests}
                removeInterestTag={() => {}}
                tiktokInterestQuery=""
                setTiktokInterestQuery={() => {}}
                tiktokInterests={tiktokInterests}
                bothPlatformsConnected={true}
                saveAudienceForPlatform={() => {}}
                saveAudienceCombined={() => {}}
                readOnly={true}
                totalReach={totalReach}
              />

              {/* Budget Section */}
              <BudgetSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                currency={currency}
                setCurrency={() => {}}
                CURRENCY_OPTIONS={[]}
                brandName={brandName}
                useSeparateBudgets={useSeparateBudgets}
                setUseSeparateBudgets={() => {}}
                unifiedBudgetAmount={unifiedBudgetAmount}
                setUnifiedBudgetAmount={() => {}}
                unifiedBudgetFrequency={unifiedBudgetFrequency}
                setUnifiedBudgetFrequency={() => {}}
                metaBudgetAmount={metaBudgetAmount}
                setMetaBudgetAmount={() => {}}
                metaBudgetFrequency={metaBudgetFrequency}
                setMetaBudgetFrequency={() => {}}
                tiktokBudgetAmount={tiktokBudgetAmount}
                setTiktokBudgetAmount={() => {}}
                tiktokBudgetFrequency={tiktokBudgetFrequency}
                setTiktokBudgetFrequency={() => {}}
                selectedPlatforms={selectedPlatforms}
                readOnly={true}
              />

              {/* Creative Section */}
              <CreativeSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                creativesByPlatform={creativesByPlatform as any}
                openCreativeModal={() => {}}
                readOnly={true}
              />

              {submissionError && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {submissionError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
