"use client";

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

type CreativeDraft = {
  primaryText?: string;
  headline?: string;
  cta?: string;
  mediaUrl?: string;
  heading?: string;
  subheading?: string;
  imageUrl?: string;
  publicId?: string;
  folder?: string;
  platform?: "meta" | "tiktok";
};

type FormObject = Record<string, FormDataEntryValue | FormDataEntryValue[]>;

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

  const [progressTab, setProgressTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const COUNTRY_OPTIONS = (
    Object.entries(metaSpecialAdLocations) as Array<
      [MetaSpecialAdLocationCode, string]
    >
  )
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const CURRENCY_OPTIONS = ["NGN", "USD", "JPY"];

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
  const [unifiedBudgetFrequency, setUnifiedBudgetFrequency] = useState<
    "daily" | "lifetime"
  >("daily");
  const [useSeparateBudgets, setUseSeparateBudgets] = useState(false);

  const [useSchedule, setUseSchedule] = useState(false);
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const [metaBudgetAmount, setMetaBudgetAmount] = useState("");
  const [tiktokBudgetAmount, setTiktokBudgetAmount] = useState("");
  const [metaBudgetFrequency, setMetaBudgetFrequency] = useState<
    "daily" | "lifetime"
  >("daily");
  const [tiktokBudgetFrequency, setTiktokBudgetFrequency] = useState<
    "daily" | "lifetime"
  >("daily");

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

  // Load campaign data from session storage
  useEffect(() => {
    try {
      setIsLoading(true);

      // Fallback test campaign used when sessionStorage has no pendingCampaign.
      const TEST_CAMPAIGN = {
        name: "Test Campaign",
        goal: "AWARENESS",
        platforms: ["meta", "tiktok"],
        budget: {
          amount: 600000,
          currency: "NGN",
          type: "lifetime",
          startDate: "2026-02-17T00:00:00.000Z",
          endDate: "2026-02-24T00:00:00.000Z",
        },
        targeting: {
          locations: ["NG"],
          ageMin: 18,
          ageMax: 65,
          gender: "all",
          interests: ["technology", "fashion"],
        },
      } as any;

      const campaignData = sessionStorage.getItem("pendingCampaign");
      const data = campaignData ? JSON.parse(campaignData) : TEST_CAMPAIGN;

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

  // Helper functions
  const validateFile = (file: File): { ok: boolean; error?: string } => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return {
        ok: false,
        error: "Unsupported file type. Upload an image or a video.",
      };
    }

    const maxImage = 10 * 1024 * 1024;
    const maxVideo = 50 * 1024 * 1024;

    if (isImage && file.size > maxImage) {
      return { ok: false, error: "Image is too large. Max 10 MB." };
    }

    if (isVideo && file.size > maxVideo) {
      return { ok: false, error: "Video is too large. Max 50 MB." };
    }

    return { ok: true };
  };

  const toDateInputValue = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeGoal = (goal: unknown): CampaignGoal => {
    const g = String(goal ?? "").toLowerCase();
    switch (g) {
      case "awareness":
        return "AWARENESS";
      case "traffic":
        return "TRAFFIC";
      case "conversions":
        return "CONVERSIONS";
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

  const isVideoUrl = (url: string) => {
    const u = String(url ?? "");
    if (!u) return false;
    if (u.includes("/video/upload/")) return true;
    return /\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i.test(u);
  };

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
          locations: [],
          ageMin: Number(metaAgeMin) || 18,
          ageMax: Number(metaAgeMax) || 65,
          gender: "all" as const,
          interests: [],
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Review Campaign
            </h1>

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
              {/* Campaign Name */}
              <div
                className="bg-white rounded-xl p-4 flex items-center justify-between
              "
              >
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
                  className="px-2 py-2 mr-4 border bg-transparent text-sm text-gray-800 rounded-lg font-medium flex items-center gap-2 hover:bg-khaki-300 transition-colors"
                >
                  Publish
                </button>
              </div>

              {/* Campaign Goal */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 0
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(0)}
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-40 border border-peru-200" />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Set campaign goal
                    </label>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="awareness"
                          name="goal"
                          value="AWARENESS"
                          checked={campaignGoal === "AWARENESS"}
                          onChange={(e) =>
                            setCampaignGoal(e.target.value as any)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="awareness"
                          className="text-sm font-medium text-gray-700"
                        >
                          Awareness
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="traffic"
                          name="goal"
                          value="TRAFFIC"
                          checked={campaignGoal === "TRAFFIC"}
                          onChange={(e) =>
                            setCampaignGoal(e.target.value as any)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="traffic"
                          className="text-sm font-medium text-gray-700"
                        >
                          Traffic
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="conversions"
                          name="goal"
                          value="CONVERSIONS"
                          checked={campaignGoal === "CONVERSIONS"}
                          onChange={(e) =>
                            setCampaignGoal(e.target.value as any)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="conversions"
                          className="text-sm font-medium text-gray-700"
                        >
                          Conversions
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="leads"
                          name="goal"
                          value="LEADS"
                          checked={campaignGoal === "LEADS"}
                          onChange={(e) =>
                            setCampaignGoal(e.target.value as any)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="leads"
                          className="text-sm font-medium text-gray-700"
                        >
                          Leads
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="sales"
                          name="goal"
                          value="SALES"
                          checked={campaignGoal === "SALES"}
                          onChange={(e) =>
                            setCampaignGoal(e.target.value as any)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="sales"
                          className="text-sm font-medium text-gray-700"
                        >
                          Sales
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose Platform */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 1
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(1)}
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-40 border border-peru-200" />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Choose platform
                    </label>
                    <p className="mt-2 font-gilroy-medium text-gray-500">
                      What platforms are you running this ad on?
                    </p>

                    <div className="flex mt-4 gap-4 flex-wrap">
                      {/* Meta Card */}
                      {selectedPlatforms.meta && (
                        <div className="inline-flex items-start gap-2 bg-gray-50 p-4 rounded-xl">
                          <img
                            src="/logos_meta-icon.png"
                            alt="meta"
                            className="mt-2"
                          />
                          <div className="mb-3 border-r pr-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <span>Growdex Limited</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-green-600 rounded-full" />
                              <span className="text-xs text-green-600 font-medium">
                                Connected
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TikTok Card */}
                      {selectedPlatforms.tiktok && (
                        <div className="inline-flex items-start gap-2 bg-mintcream-50 p-4 rounded-xl">
                          <img src="/logos_tiktok-icon.png" alt="tiktok-icon" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Grow with Growdex
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-green-600 rounded-full" />
                              <span className="text-xs text-green-600 font-medium">
                                Connected
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 2
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(2)}
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-40 border border-peru-200" />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Target audience
                    </label>
                    <p className="mt-2 font-gilroy-medium text-gray-500">
                      Select the audience you want to reach
                    </p>

                    <div className="mt-4 space-y-3 text-sm">
                      {metaCountries.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-700">
                            Locations:
                          </p>
                          <p className="text-gray-600">
                            {metaCountries.join(", ")}
                          </p>
                        </div>
                      )}

                      {metaInterests.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-700">
                            Interests:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {metaInterests.map((interest) => (
                              <span
                                key={interest}
                                className="bg-white px-2 py-1 rounded border border-gray-200 text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(metaAgeMin || metaAgeMax) && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-700">
                            Age Range:
                          </p>
                          <p className="text-gray-600">
                            {metaAgeMin} - {metaAgeMax}
                          </p>
                        </div>
                      )}

                      {tiktokCountries.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-700">
                            TikTok Locations:
                          </p>
                          <p className="text-gray-600">
                            {tiktokCountries.join(", ")}
                          </p>
                        </div>
                      )}

                      {tiktokInterests.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-700">
                            TikTok Interests:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tiktokInterests.map((interest) => (
                              <span
                                key={interest}
                                className="bg-white px-2 py-1 rounded border border-gray-200 text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget and Schedule */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 3
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(3)}
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-full border border-peru-200" />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Budget and schedule
                    </label>

                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700">
                          <span className="font-medium">Amount:</span>{" "}
                          {currency} {unifiedBudgetAmount}
                        </p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">Type:</span>{" "}
                          {unifiedBudgetFrequency === "daily"
                            ? "Daily"
                            : "Lifetime"}
                        </p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">Start Date:</span>{" "}
                          {scheduleStartDate
                            ? new Date(scheduleStartDate).toLocaleDateString()
                            : "Not set"}
                        </p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">End Date:</span>{" "}
                          {scheduleEndDate
                            ? new Date(scheduleEndDate).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creative setup */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 4
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(4)}
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-full border border-peru-200" />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Creative setup
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Meta Creative */}
                      <div
                        className={`bg-gray-50 rounded-xl p-3 ${selectedPlatforms.meta ? "" : "opacity-50"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-3 items-center">
                            <img
                              src="/logos_meta-icon.png"
                              alt="meta"
                              className="h-8"
                            />
                            <div>
                              <p className="font-medium">Meta creative</p>
                              <p className="text-sm text-gray-600">
                                {creativesByPlatform.meta?.headline ??
                                  creativesByPlatform.meta?.heading ??
                                  "—"}
                              </p>
                            </div>
                          </div>
                          <MoreVerticalIcon />
                        </div>

                        <div className="mt-3">
                          {creativesByPlatform.meta?.mediaUrl ? (
                            isVideoUrl(creativesByPlatform.meta.mediaUrl) ? (
                              <video
                                src={creativesByPlatform.meta.mediaUrl}
                                controls
                                className="w-full h-44 object-cover rounded-lg bg-white"
                              />
                            ) : (
                              <img
                                src={creativesByPlatform.meta.mediaUrl}
                                alt="meta creative"
                                className="w-full h-44 object-cover rounded-lg bg-white"
                              />
                            )
                          ) : (
                            <img
                              src="/media-creative.png"
                              alt="no creative"
                              className="w-full h-44 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>

                      {/* TikTok Creative */}
                      <div
                        className={`bg-gray-50 rounded-xl p-3 ${selectedPlatforms.tiktok ? "" : "opacity-50"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-3 items-center">
                            <img
                              src="/logos_tiktok-icon.png"
                              alt="tiktok"
                              className="h-8"
                            />
                            <div>
                              <p className="font-medium">TikTok creative</p>
                              <p className="text-sm text-gray-600">
                                {creativesByPlatform.tiktok?.headline ??
                                  creativesByPlatform.tiktok?.heading ??
                                  "—"}
                              </p>
                            </div>
                          </div>
                          <MoreVerticalIcon />
                        </div>

                        <div className="mt-3">
                          {creativesByPlatform.tiktok?.mediaUrl ? (
                            isVideoUrl(creativesByPlatform.tiktok.mediaUrl) ? (
                              <video
                                src={creativesByPlatform.tiktok.mediaUrl}
                                controls
                                className="w-full h-44 object-cover rounded-lg bg-white"
                              />
                            ) : (
                              <img
                                src={creativesByPlatform.tiktok.mediaUrl}
                                alt="tiktok creative"
                                className="w-full h-44 object-cover rounded-lg bg-white"
                              />
                            )
                          ) : (
                            <img
                              src="/media-creative.png"
                              alt="no creative"
                              className="w-full h-44 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {submissionError && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {submissionError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPublishing}
                className="w-full bg-khaki-200 hover:bg-khaki-300 text-black text-center cursor-pointer"
              >
                <CircleArrowRight />
                {isPublishing ? "Publishing..." : "Publish campaign"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
