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
  updateCampaign,
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
import { hashFolderName } from "@/lib/encrypt";
import { CLOUDINARY_FOLDER } from "@/lib/constants";
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

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReachEstimate = async (
    platform: "meta" | "tiktok",
    type: "interest" | "location" | "country",
    value: string,
  ) => {
    try {
      const res = await apiFetch("/campaigns/reach-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, type, value }),
      });

      if (res.ok) {
        const data = await res.json();
        const reach = Number(data.reach) || 10000;
        setTotalReach((prev) => prev + reach);
      } else {
        setTotalReach((prev) => prev + 10000);
      }
    } catch (err) {
      console.error("Failed to fetch reach estimate:", err);
      setTotalReach((prev) => prev + 10000);
    }
  };

  const normalizeTag = (value: string) => value.trim().replace(/\s+/g, " ");

  const addLocationTag = (platform: "meta" | "tiktok", value: string) => {
    const next = normalizeTag(value);
    if (!next) return;

    if (platform === "meta") {
      const lower = next.toLowerCase();
      if (metaLocations.some((x) => x.toLowerCase() === lower)) {
        setMetaLocationQuery("");
        return;
      }
      setMetaLocations((prev) => [...prev, next]);
      fetchReachEstimate("meta", "location", next);
      setMetaLocationQuery("");
      return;
    }

    const lower = next.toLowerCase();
    if (tiktokLocations.some((x) => x.toLowerCase() === lower)) {
      setTiktokLocationQuery("");
      return;
    }
    setTiktokLocations((prev) => [...prev, next]);
    fetchReachEstimate("tiktok", "location", next);
    setTiktokLocationQuery("");
  };

  const removeLocationTag = (platform: "meta" | "tiktok", value: string) => {
    if (platform === "meta") {
      setMetaLocations((prev) => prev.filter((x) => x !== value));
      return;
    }
    setTiktokLocations((prev) => prev.filter((x) => x !== value));
  };

  const addInterestTag = (platform: "meta" | "tiktok", value: string) => {
    const next = normalizeTag(value);
    if (!next) return;

    if (platform === "meta") {
      const lower = next.toLowerCase();
      if (metaInterests.some((x) => x.toLowerCase() === lower)) {
        setMetaInterestQuery("");
        return;
      }
      setMetaInterests((prev) => [...prev, next]);
      fetchReachEstimate("meta", "interest", next);
      setMetaInterestQuery("");
      return;
    }

    const lower = next.toLowerCase();
    if (tiktokInterests.some((x) => x.toLowerCase() === lower)) {
      setTiktokInterestQuery("");
      return;
    }
    setTiktokInterests((prev) => [...prev, next]);
    fetchReachEstimate("tiktok", "interest", next);
    setTiktokInterestQuery("");
  };

  const removeInterestTag = (platform: "meta" | "tiktok", value: string) => {
    if (platform === "meta") {
      setMetaInterests((prev) => prev.filter((x) => x !== value));
      return;
    }
    setTiktokInterests((prev) => prev.filter((x) => x !== value));
  };

  const toggleCountry = (
    platform: "meta" | "tiktok",
    code: MetaSpecialAdLocationCode,
    checked: boolean,
  ) => {
    const setter = platform === "meta" ? setMetaCountries : setTiktokCountries;
    const currentList = platform === "meta" ? metaCountries : tiktokCountries;

    if (checked) {
      if (currentList.includes(code)) return;
      setter((prev) => [...prev, code]);
      fetchReachEstimate(platform, "country", code);
      return;
    }

    if (currentList.length <= 1) return;
    setter((prev) => prev.filter((c) => c !== code));
  };

  const openCreativeModal = (type: "meta" | "tiktok") => {
    setCreativeType(type);
    setCreativeHeading("");
    setCreativeSubheading("");
    setCreativeImage(null);
    setCreativePreview(null);
    setIsCreativeModalOpen(true);
  };

  const COUNTRY_OPTIONS = (
    Object.entries(metaSpecialAdLocations) as Array<
      [MetaSpecialAdLocationCode, string]
    >
  )
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

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

      if (!data.id) {
        console.error("No campaign ID found in session storage.");
        setIsLoading(false);
        router.replace("/panel/campaigns/new");
        return;
      }

      setCampaignId(data.id);
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

  const getPayload = (): CreateCampaignPayload | null => {
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
        return null;
      }

      startDate = scheduledStart;
      endDate = scheduledEnd;
    }

    const platforms = Object.entries(selectedPlatforms)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([platform]) => platform);

    if (platforms.length === 0) {
      setSubmissionError("Please choose at least one platform.");
      return null;
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

    return {
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
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!campaignId) return;

    setSubmissionError(null);
    const payload = getPayload();
    if (!payload) return;

    try {
      setIsUpdating(true);
      await updateCampaign(campaignId, payload);
      // Update session storage with new values
      const currentSession = JSON.parse(
        sessionStorage.getItem("pendingCampaign") || "{}",
      );
      sessionStorage.setItem(
        "pendingCampaign",
        JSON.stringify({
          ...currentSession,
          name: payload.name,
          goal: payload.goal,
          platforms: payload.platforms,
          budget: payload.budget,
          targeting: payload.targeting,
          // creatives and reach etc might need update too but payload has simplified structure
        }),
      );
    } catch (err) {
      console.error("Update error:", err);
      setSubmissionError(
        err instanceof Error ? err.message : "Failed to update campaign",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreativeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!creativeType) return;

    try {
      setUploadError(null);

      if (!creativeImage) {
        setUploadError("Please select an image or video.");
        return;
      }

      const encryptedFolder = await hashFolderName();
      const safeName = creativeImage.name
        .replace(/\.[^/.]+$/, "")          // strip extension
        .replace(/[^a-zA-Z0-9_-]/g, "_");  // replace unsafe chars
      const publicId =
        `${encryptedFolder.slice(0, 20)}/${safeName}_${Date.now()}`;

      const confirmed = window.confirm(
        "Once you upload this creative, it will be saved to Cloudinary and you won't be able to edit it. To make changes later, you'll need to upload a new creative.\n\nDo you want to continue?",
      );

      if (!confirmed) return;

      setIsUploading(true);
      setUploadProgress(0);

      // Get signature stamp from backend
      const signRes = await apiFetch("/media/signature-stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          folder: CLOUDINARY_FOLDER,
        }),
      });

      if (!signRes.ok) {
        const errText = await signRes.text().catch(() => "");
        throw new Error(
          `Failed to get signature stamp (${signRes.status}): ${errText}`,
        );
      }

      const signPayload = await signRes.json();
      console.log(signPayload);

      const signature = signPayload.signature;
      const timestamp = signPayload.timestamp;
      const api_key = signPayload.api_key;
      const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      // Build FormData for Cloudinary
      const formData = new FormData();
      formData.append("file", creativeImage);
      formData.append("api_key", api_key);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", String(signature));
      formData.append("public_id", publicId);
      formData.append("folder", CLOUDINARY_FOLDER);

      const resourceType = creativeImage.type.startsWith("video/")
        ? "video"
        : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`;

      // Upload with progress using XHR
      const uploadResult: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve(json);
            } catch (err) {
              reject(new Error("Invalid JSON response from Cloudinary"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload error"));
        xhr.send(formData);
      });

      const secureUrl = uploadResult.secure_url;
      console.log("Cloudinary upload result", uploadResult);

      setCreativesByPlatform((prev) => ({
        ...prev,
        [creativeType]: {
            ...prev[creativeType],
          primaryText: creativeSubheading,
          headline: creativeHeading,
          cta: "LEARN_MORE",
          mediaUrl: secureUrl,
          publicId,
          folder: CLOUDINARY_FOLDER,
          platform: creativeType,
        },
      }));

      setIsCreativeModalOpen(false);
    } catch (err) {
      console.error("Creative upload error:", err);
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload creative",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.ok) {
      setUploadError(validation.error ?? "Unsupported file");
      setCreativeImage(null);
      setCreativePreview(null);
      return;
    }

    setUploadError(null);
    setCreativeImage(file);
    setCreativePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.ok) {
      setUploadError(validation.error ?? "Unsupported file");
      setCreativeImage(null);
      setCreativePreview(null);
      return;
    }

    setUploadError(null);
    setCreativeImage(file);
    setCreativePreview(URL.createObjectURL(file));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handlePublishCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!campaignId) {
      setSubmissionError("Missing campaign ID");
      return;
    }

    // Optional: Auto-update before publishing
    const payload = getPayload();
    if (!payload) return;

    try {
      setIsPublishing(true);

      // Verify payload is valid and potentially update
      await updateCampaign(campaignId, payload);

      console.log("Publishing campaign ID:", campaignId);
      await publishCampaign(campaignId);
      console.log("Campaign published successfully");

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
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleUpdate()}
                    disabled={isUpdating || isPublishing}
                  >
                    {isUpdating ? "Saving..." : "Save changes"}
                  </Button>
                  <button
                    type="submit"
                    disabled={isPublishing || isUpdating}
                    className="px-6 py-2 border bg-khaki-200 text-sm text-gray-800 rounded-lg font-bold flex items-center gap-2 hover:bg-khaki-300 transition-colors shadow-sm"
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>

              {/* Goal Section */}
              <GoalSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                campaignGoal={campaignGoal as CampaignGoal}
                setCampaignGoal={setCampaignGoal}
              />

              {/* Platform Section */}
              <PlatformSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                setSelectedPlatforms={setSelectedPlatforms}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
              />

              {/* Audience Section */}
              <AudienceSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
                loadingAudiences={loadingAudiences}
                savedAudiences={savedAudiences}
                applyAudienceToForm={() => {}}
                formatCountriesSummary={(codes) => codes.join(", ")}
                COUNTRY_OPTIONS={COUNTRY_OPTIONS}
                metaCountries={metaCountries}
                tiktokCountries={tiktokCountries}
                toggleCountry={toggleCountry}
                metaLocationQuery={metaLocationQuery}
                setMetaLocationQuery={setMetaLocationQuery}
                tiktokLocationQuery={tiktokLocationQuery}
                setTiktokLocationQuery={setTiktokLocationQuery}
                addLocationTag={addLocationTag}
                metaLocations={metaLocations}
                removeLocationTag={removeLocationTag}
                tiktokLocations={tiktokLocations}
                metaAgeMin={metaAgeMin}
                setMetaAgeMin={setMetaAgeMin}
                metaAgeMax={metaAgeMax}
                setMetaAgeMax={setMetaAgeMax}
                metaInterestQuery={metaInterestQuery}
                setMetaInterestQuery={setMetaInterestQuery}
                addInterestTag={addInterestTag}
                metaInterests={metaInterests}
                removeInterestTag={removeInterestTag}
                tiktokInterestQuery={tiktokInterestQuery}
                setTiktokInterestQuery={setTiktokInterestQuery}
                tiktokInterests={tiktokInterests}
                bothPlatformsConnected={true}
                saveAudienceForPlatform={() => {}}
                saveAudienceCombined={() => {}}
                totalReach={totalReach}
              />

              {/* Budget Section */}
              <BudgetSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                currency={currency}
                setCurrency={setCurrency}
                CURRENCY_OPTIONS={["NGN", "USD", "JPY"]}
                brandName={brandName}
                useSeparateBudgets={useSeparateBudgets}
                setUseSeparateBudgets={setUseSeparateBudgets}
                unifiedBudgetAmount={unifiedBudgetAmount}
                setUnifiedBudgetAmount={setUnifiedBudgetAmount}
                unifiedBudgetFrequency={unifiedBudgetFrequency}
                setUnifiedBudgetFrequency={setUnifiedBudgetFrequency}
                metaBudgetAmount={metaBudgetAmount}
                setMetaBudgetAmount={setMetaBudgetAmount}
                metaBudgetFrequency={metaBudgetFrequency}
                setMetaBudgetFrequency={setMetaBudgetFrequency}
                tiktokBudgetAmount={tiktokBudgetAmount}
                setTiktokBudgetAmount={setTiktokBudgetAmount}
                tiktokBudgetFrequency={tiktokBudgetFrequency}
                setTiktokBudgetFrequency={setTiktokBudgetFrequency}
                selectedPlatforms={selectedPlatforms}
              />

              {/* Creative Section */}
              <CreativeSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                creativesByPlatform={creativesByPlatform as any}
                openCreativeModal={openCreativeModal}
              />

              {submissionError && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {submissionError}
                </p>
              )}
            </form>

            {/* Creative Modal */}
            {isCreativeModalOpen && (
              <div className="fixed inset-0 bg-slate-800/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[600px] overflow-y-auto hide-scrollbar">
                  <form onSubmit={handleCreativeSubmit}>
                    <div className="p-4 border-b">
                      <h2 className="text-lg font-bold text-center">
                        {creativeType === "meta"
                          ? "Meta Creative"
                          : "TikTok Creative"}
                      </h2>
                    </div>

                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Heading
                        </label>
                        <Input
                          value={creativeHeading}
                          onChange={(e) =>
                            setCreativeHeading(
                              (e.target as HTMLInputElement).value,
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sub heading
                        </label>
                        <Input
                          value={creativeSubheading}
                          onChange={(e) =>
                            setCreativeSubheading(
                              (e.target as HTMLInputElement).value,
                            )
                          }
                        />
                      </div>

                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          uploadError
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-khaki-200"
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={handleBrowseClick}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*,video/*"
                          onChange={handleImageChange}
                        />

                        {creativePreview ? (
                          <div className="relative">
                            {creativeImage?.type.startsWith("video/") ? (
                              <video
                                src={creativePreview}
                                className="mx-auto max-h-48 rounded"
                                controls
                              />
                            ) : (
                              <img
                                src={creativePreview}
                                alt="Preview"
                                className="mx-auto max-h-48 object-contain rounded"
                              />
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                              Click or drag safely to replace
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              SVG, PNG, JPG or GIF (max. 800x400px)
                            </p>
                          </div>
                        )}
                      </div>

                      {uploadError && (
                        <p className="text-sm text-red-500">{uploadError}</p>
                      )}

                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-khaki-200 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                          <p className="text-xs text-center mt-1 text-gray-500">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsCreativeModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUploading}
                        className="bg-khaki-200 hover:bg-khaki-300 text-black"
                      >
                        {isUploading ? "Uploading..." : "Save Creative"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
