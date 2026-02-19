"use client";

import { useRef, useState } from "react";
import type { MetaSpecialAdLocationCode } from "@/lib/meta-special-ad-locations";
import type { Audience } from "@/lib/audiences";
import { CreativeDraft } from "@/lib/campaign-shared";

export function useCampaignFormState() {
  const [progressTab, setProgressTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPlatforms, setSelectedPlatforms] = useState({
    meta: true,
    tiktok: true,
  });

  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");

  const [metaCountries, setMetaCountries] = useState<
    MetaSpecialAdLocationCode[]
  >(["NG"]);
  const [tiktokCountries, setTiktokCountries] = useState<
    MetaSpecialAdLocationCode[]
  >(["NG"]);

  const [metaLocationQuery, setMetaLocationQuery] = useState("");
  const [tiktokLocationQuery, setTiktokLocationQuery] = useState("");
  const [metaLocations, setMetaLocations] = useState<string[]>([
    "Makurdi",
    "Abuja",
    "Lagos",
    "Kano",
  ]);
  const [tiktokLocations, setTiktokLocations] = useState<string[]>([
    "Makurdi",
    "Abuja",
    "Lagos",
    "Kano",
  ]);

  const [metaInterestQuery, setMetaInterestQuery] = useState("");
  const [tiktokInterestQuery, setTiktokInterestQuery] = useState("");
  const [metaInterests, setMetaInterests] = useState<string[]>([
    "technology",
    "fashion",
  ]);
  const [tiktokInterests, setTiktokInterests] = useState<string[]>([
    "technology",
    "fashion",
  ]);

  const [metaAgeMin, setMetaAgeMin] = useState("18");
  const [metaAgeMax, setMetaAgeMax] = useState("65");

  const [currency, setCurrency] = useState("NGN");

  const [unifiedBudgetAmount, setUnifiedBudgetAmount] = useState("");
  const [unifiedBudgetFrequency, setUnifiedBudgetFrequency] =
    useState<"daily" | "lifetime">("daily");
  const [useSeparateBudgets, setUseSeparateBudgets] = useState(false);

  const [useSchedule, setUseSchedule] = useState(false);
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const [metaBudgetAmount, setMetaBudgetAmount] = useState("");
  const [tiktokBudgetAmount, setTiktokBudgetAmount] = useState("");
  const [metaBudgetFrequency, setMetaBudgetFrequency] =
    useState<"daily" | "lifetime">("daily");
  const [tiktokBudgetFrequency, setTiktokBudgetFrequency] =
    useState<"daily" | "lifetime">("daily");

  const [isPublishing, setIsPublishing] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [creativesByPlatform, setCreativesByPlatform] = useState<
    Partial<Record<"meta" | "tiktok", CreativeDraft>>
  >({});

  // Saved audiences
  const [savedAudiences, setSavedAudiences] = useState<Audience[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);

  // Creative modal state
  const [isCreativeModalOpen, setIsCreativeModalOpen] = useState(false);
  const [creativeType, setCreativeType] = useState<"meta" | "tiktok" | null>(
    null,
  );
  const [creativeHeading, setCreativeHeading] = useState("");
  const [creativeSubheading, setCreativeSubheading] = useState("");
  const [creativeImage, setCreativeImage] = useState<File | null>(null);
  const [creativePreview, setCreativePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return {
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
  } as const;
}
