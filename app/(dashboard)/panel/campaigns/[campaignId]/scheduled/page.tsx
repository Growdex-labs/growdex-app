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

  const validateFile = (file: File): { ok: boolean; error?: string } => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return {
        ok: false,
        error: "Unsupported file type. Upload an image or a video.",
      };
    }

    const maxImage = 10 * 1024 * 1024; // 10MB
    const maxVideo = 50 * 1024 * 1024; // 50MB

    if (isImage && file.size > maxImage) {
      return { ok: false, error: "Image is too large. Max 10 MB." };
    }

    if (isVideo && file.size > maxVideo) {
      return { ok: false, error: "Video is too large. Max 50 MB." };
    }

    return { ok: true };
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

  const toDateInputValue = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleGoLive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);

    try {
      setIsGoingLive(true);

      const response = await apiFetch(`/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate campaign");
      }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Scheduled Campaign
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

            <form className="space-y-6" onSubmit={handleGoLive}>
              {/* Campaign Name */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex gap-3 items-center">
                  <img src="/megaphone.png" alt="megaphone-icon" />
                  <div className="flex-1">
                    <label
                      htmlFor="campaignName"
                      className="block text-sm font-medium text-gray-500"
                    >
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      id="campaignName"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      maxLength={100}
                      className="mt-1 block w-full focus:border-b focus:border-khaki-200 focus:outline-none md:text-lg lg:text-2xl"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Goal Section */}
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
                      <div className="inline-flex items-center gap-3">
                        <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">
                          {campaignGoal}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose Platform Section */}
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

              {/* Budget and Schedule Section */}
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

              {submissionError && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {submissionError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isGoingLive}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-center cursor-pointer"
              >
                <CircleArrowRight />
                {isGoingLive ? "Going live..." : "Go live"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
