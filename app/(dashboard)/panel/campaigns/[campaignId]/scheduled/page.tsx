"use client";

import { useState, useRef, useEffect, use } from "react";
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
  fetchCampaignById,
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
  SignatureStampPayload,
  SignatureStampResponse,
  CloudinaryUploadResponse,
  validateFile,
  toDateInputValue,
  isVideoUrl,
} from "@/lib/campaign-shared";
import { GoalSection } from "../../components/GoalSection";
import { PlatformSection } from "../../components/PlatformSection";
import { AudienceSection } from "../../components/AudienceSection";
import { BudgetSection } from "../../components/BudgetSection";
import { CreativeSection } from "../../components/CreativeSection";

interface PageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default function ScheduledCampaignPage({ params }: PageProps) {
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
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>("AWARENESS");

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

  const [lowerReach, setLowerReach] = useState(1000);
  const [upperReach, setUpperReach] = useState(5000);

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

  const [isGoingLive, setIsGoingLive] = useState(false);
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

  // Resolve params promise (Next.js may pass params as a Promise)
  const resolvedParams = use(params);
  const campaignId = resolvedParams.campaignId;

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setIsLoading(true);
        const campaign = await fetchCampaignById(campaignId);

        if (!campaign) {
          setSubmissionError("Campaign not found");
          return;
        }

        // Pre-fill form with campaign data
        setCampaignName(campaign.name || "");
        setCampaignGoal(campaign.goal || "AWARENESS");

        // Platforms
        const platforms = campaign.platforms || [];
        setSelectedPlatforms({
          meta: platforms.includes("meta"),
          tiktok: platforms.includes("tiktok"),
        });

        // Targeting
        if (campaign.targeting) {
          const targeting = campaign.targeting;

          if (targeting.locations && targeting.locations.length > 0) {
            setMetaCountries(
              targeting.locations as MetaSpecialAdLocationCode[],
            );
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

        // Budget
        if (campaign.budget) {
          const budget = campaign.budget;
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

        // Creatives - not needed for scheduled view, but shown if available
        // Campaigns can be viewed with existing creatives or added later
      } catch (err) {
        console.error("Failed to load campaign:", err);
        setSubmissionError(
          err instanceof Error ? err.message : "Failed to load campaign",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);
  const openCreativeModal = (type: "meta" | "tiktok") => {
    setCreativeType(type);
    setCreativeHeading("");
    setCreativeSubheading("");
    setCreativeImage(null);
    setCreativePreview(null);
    setIsCreativeModalOpen(true);
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

  const normalizeTag = (value: string) => value.trim().replace(/\s+/g, " ");

  const addLocationTag = (platform: "meta" | "tiktok", value: string) => {
    const next = normalizeTag(value);
    if (!next) return;

    if (platform === "meta") {
      setMetaLocations((prev) =>
        prev.some((x) => x.toLowerCase() === next.toLowerCase())
          ? prev
          : [...prev, next],
      );
      setMetaLocationQuery("");
      return;
    }

    setTiktokLocations((prev) =>
      prev.some((x) => x.toLowerCase() === next.toLowerCase())
        ? prev
        : [...prev, next],
    );
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
      setMetaInterests((prev) =>
        prev.some((x) => x.toLowerCase() === next.toLowerCase())
          ? prev
          : [...prev, next],
      );
      setMetaInterestQuery("");
      return;
    }

    setTiktokInterests((prev) =>
      prev.some((x) => x.toLowerCase() === next.toLowerCase())
        ? prev
        : [...prev, next],
    );
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
    setter((prev) => {
      const exists = prev.includes(code);
      if (checked) {
        return exists ? prev : [...prev, code];
      }

      if (prev.length <= 1) return prev;
      return prev.filter((c) => c !== code);
    });
  };

  const formatCountriesSummary = (codes: MetaSpecialAdLocationCode[]) => {
    if (!codes?.length) return "Select countries";
    const names = codes.map((c) => metaSpecialAdLocations[c]).filter(Boolean);
    if (names.length <= 2) return names.join(", ");
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
  };

  const handleGoLive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);

    try {
      setIsGoingLive(true);

      await publishCampaign(campaignId as string);

      window.location.href = "/panel/campaigns";
    } catch (err) {
      console.error("Go live error:", err);
      setSubmissionError(
        err instanceof Error ? err.message : "Failed to go live",
      );
      setIsGoingLive(false);
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

      const CLOUDINARY_FOLDER = "growdex_campaigns";
      const publicId =
        `${CLOUDINARY_FOLDER}/${creativeImage.name}/` + Date.now();

      const confirmed = window.confirm(
        "Once you upload this creative, it will be saved to Cloudinary and you won't be able to edit it. To make changes later, you'll need to upload a new creative.\n\nDo you want to continue?",
      );

      if (!confirmed) return;

      setIsUploading(true);
      setUploadProgress(0);

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
      const signature = signPayload.signature;
      const timestamp = signPayload.timestamp;
      const api_key = signPayload.api_key;
      const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

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
              const resp = JSON.parse(xhr.responseText);
              resolve(resp);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload error"));
        xhr.send(formData);
      });

      const secureUrl = uploadResult.secure_url;

      setCreativesByPlatform((prev) => ({
        ...prev,
        [creativeType]: {
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

  const saveAudienceForPlatform = async (platform: "meta" | "tiktok") => {
    try {
      const name = window.prompt("Enter a name for this audience:");
      if (!name) return;

      const payload: any = {
        name,
        country: platform === "meta" ? metaCountries : tiktokCountries,
        locations: platform === "meta" ? metaLocations : tiktokLocations,
        interests: platform === "meta" ? metaInterests : tiktokInterests,
        platforms: [platform],
      };

      if (platform === "meta") {
        payload.metaConfig = {
          ageMin: Number(metaAgeMin) || 18,
          ageMax: Number(metaAgeMax) || 65,
          gender: "ALL",
        };
      }

      if (platform === "tiktok") {
        payload.tiktokConfig = {
          ageRanges: ["AGE_18_24", "AGE_25_34"],
          gender: "GENDER_UNLIMITED",
        };
      }

      const res = await createAudience(payload);
      window.alert("Audience saved successfully.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to save audience",
      );
    }
  };

  const [socialAccounts, setSocialAccounts] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await hydrateSocialAccounts();
        if (!mounted) return;
        if (res.success) setSocialAccounts(res.data ?? {});
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const bothPlatformsConnected = Boolean(
    socialAccounts?.meta?.connected && socialAccounts?.tiktok?.connected,
  );

  const saveAudienceCombined = async () => {
    try {
      const name = window.prompt("Enter a name for this audience:");
      if (!name) return;

      const payload: any = {
        name,
        country: Array.from(new Set([...metaCountries, ...tiktokCountries])),
        locations: Array.from(new Set([...metaLocations, ...tiktokLocations])),
        interests: Array.from(new Set([...metaInterests, ...tiktokInterests])),
        platforms: ["meta", "tiktok"],
        metaConfig: {
          ageMin: Number(metaAgeMin) || 18,
          ageMax: Number(metaAgeMax) || 65,
          gender: "ALL",
        },
        tiktokConfig: {
          ageRanges: ["AGE_18_24", "AGE_25_34"],
          gender: "GENDER_UNLIMITED",
        },
      };

      const res = await createAudience(payload);
      window.alert("Audience saved successfully.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to save audience",
      );
    }
  };

  const loadSavedAudiences = async () => {
    try {
      setLoadingAudiences(true);
      const audiences = await fetchAudiences();
      setSavedAudiences(audiences);
    } catch (err) {
      console.error("Failed to load audiences:", err);
    } finally {
      setLoadingAudiences(false);
    }
  };

  const applyAudienceToForm = (audience: Audience) => {
    if (audience.country && audience.country.length > 0) {
      setMetaCountries(audience.country as MetaSpecialAdLocationCode[]);
      setTiktokCountries(audience.country as MetaSpecialAdLocationCode[]);
    }

    if (audience.locations && audience.locations.length > 0) {
      setMetaLocations(audience.locations);
      setTiktokLocations(audience.locations);
    }

    if (audience.interests && audience.interests.length > 0) {
      setMetaInterests(audience.interests);
      setTiktokInterests(audience.interests);
    }

    if (audience.metaConfig) {
      if (audience.metaConfig.ageMin)
        setMetaAgeMin(String(audience.metaConfig.ageMin));
      if (audience.metaConfig.ageMax)
        setMetaAgeMax(String(audience.metaConfig.ageMax));
    }
  };

  useEffect(() => {
    loadSavedAudiences();
  }, []);

  const progressTitles = [
    "Set campaign goal",
    "Choose platform",
    "Target audience",
    "Budget and schedule",
    "Creative setup",
  ];

  const isVideoUrl = (url: string) => {
    const u = String(url ?? "");
    if (!u) return false;
    if (u.includes("/video/upload/")) return true;
    return /\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i.test(u);
  };

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
                Scheduled Campaign
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

            <form className="space-y-6" onSubmit={handleGoLive}>
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
                      readOnly
                      className="mt-1 block w-full focus:outline-none md:text-lg lg:text-2xl font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGoingLive}
                  className="px-6 py-2 border bg-khaki-200 text-sm text-gray-800 rounded-lg font-bold flex items-center gap-2 hover:bg-khaki-300 transition-colors shadow-sm"
                >
                  {isGoingLive ? "Going live..." : "Go Live"}
                </button>
              </div>

              {/* Goal Section */}
              <GoalSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                campaignGoal={campaignGoal}
                setCampaignGoal={() => {}}
                readOnly={true}
              />

              {/* Platform Section */}
              <PlatformSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                setSelectedPlatforms={() => {}}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
                readOnly={true}
              />

              {/* Audience Section */}
              <AudienceSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                lowerReach={lowerReach}
                upperReach={upperReach}
                setLowerReach={setLowerReach}
                setUpperReach={setUpperReach}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
                loadingAudiences={false}
                savedAudiences={[]}
                applyAudienceToForm={() => {}}
                formatCountriesSummary={(codes) => codes.join(", ")}
                COUNTRY_OPTIONS={[]}
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
                useSchedule={useSchedule}
                setUseSchedule={() => {}}
                scheduleStartDate={scheduleStartDate}
                setScheduleStartDate={() => {}}
                scheduleEndDate={scheduleEndDate}
                setScheduleEndDate={() => {}}
                scheduleTime={scheduleTime}
                setScheduleTime={() => {}}
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
