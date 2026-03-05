"use client";

import { useState, useRef } from "react";
import { useEffect } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
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
  isVideoUrl,
  toDateInputValue,
  validateFile,
} from "@/lib/campaign-shared";
import { GoalSection } from "../components/GoalSection";
import { PlatformSection } from "../components/PlatformSection";
import { AudienceSection } from "../components/AudienceSection";
import { BudgetSection } from "../components/BudgetSection";
import { CreativeSection } from "../components/CreativeSection";
import { hashFolderName } from "@/lib/encrypt";
import { CLOUDINARY_FOLDER } from "@/lib/constants";

export default function NewCampaignPage() {
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
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>("ENGAGEMENT");

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
    tiktok: false,
  });

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
  const [totalReach, setTotalReach] = useState<number>(0);

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

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
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

  const fetchReachEstimate = async (
    platform: "meta" | "tiktok",
    type: "interest" | "location" | "country",
    value: string,
  ) => {
    try {
      // Placeholder endpoint
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
        // Fallback mock increment
        setTotalReach((prev) => prev + 10000);
      }
    } catch (err) {
      console.error("Failed to fetch reach estimate:", err);
      // Fallback mock increment
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

  const formatCountriesSummary = (codes: MetaSpecialAdLocationCode[]) => {
    if (!codes?.length) return "Select countries";
    const names = codes.map((c) => metaSpecialAdLocations[c]).filter(Boolean);
    if (names.length <= 2) return names.join(", ");
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
  };

  const formDataToObject = (fd: FormData) => {
    const obj: FormObject = {};
    for (const [key, value] of fd.entries()) {
      const existing = obj[key];
      if (existing !== undefined) {
        obj[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
        continue;
      }

      obj[key] = value;
    }
    return obj;
  };

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

  const addDaysDateInputValue = (dateValue: string, days: number) => {
    const base = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(base.getTime())) return dateValue;
    base.setDate(base.getDate() + days);
    return toDateInputValue(base);
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

  const addDaysUtcIso = (iso: string, days: number) => {
    const base = new Date(iso);
    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString();
  };

  const handleCreateCampaignSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setSubmissionError(null);

    const fd = new FormData(e.currentTarget);
    const raw = formDataToObject(fd);

    const platforms = Object.entries(selectedPlatforms)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([platform]) => platform);

    if (platforms.length === 0) {
      setSubmissionError("Please choose at least one platform.");
      return;
    }

    const selectedLocations = [
      ...(selectedPlatforms.meta ? metaCountries : []),
      ...(selectedPlatforms.tiktok ? tiktokCountries : []),
    ];
    const uniqueLocations = Array.from(new Set<string>(selectedLocations));

    const selectedInterests = [
      ...(selectedPlatforms.meta ? metaInterests : []),
      ...(selectedPlatforms.tiktok ? tiktokInterests : []),
    ]
      .map((x) => normalizeTag(String(x ?? "")))
      .filter(Boolean);
    const uniqueInterests = Array.from(new Set<string>(selectedInterests));

    const budgetAmountMeta = selectedPlatforms.meta
      ? Number(metaBudgetAmount || 0)
      : 0;
    const budgetAmountTiktok = selectedPlatforms.tiktok
      ? Number(tiktokBudgetAmount || 0)
      : 0;
    const splitBudgetAmount =
      (Number.isFinite(budgetAmountMeta) ? budgetAmountMeta : 0) +
      (Number.isFinite(budgetAmountTiktok) ? budgetAmountTiktok : 0);

    const unifiedBudgetAmountNumber = Number(unifiedBudgetAmount || 0);
    const normalizedUnifiedBudgetAmount = Number.isFinite(
      unifiedBudgetAmountNumber,
    )
      ? unifiedBudgetAmountNumber
      : 0;

    const splitBudgetType: BudgetType = (() => {
      const types: BudgetType[] = [];
      if (selectedPlatforms.meta) types.push(metaBudgetFrequency);
      if (selectedPlatforms.tiktok) types.push(tiktokBudgetFrequency);

      if (types.includes("lifetime")) return "lifetime";
      return "daily";
    })();

    const budgetAmount = useSeparateBudgets
      ? splitBudgetAmount
      : normalizedUnifiedBudgetAmount;

    const budgetType: BudgetType = useSeparateBudgets
      ? splitBudgetType
      : unifiedBudgetFrequency;

    // Add a 15-minute buffer to ensure "now" is always in the future for the backend
    const defaultStartDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const defaultEndDate = addDaysUtcIso(defaultStartDate, 7);

    let startDate = defaultStartDate;
    let endDate = defaultEndDate;
    if (useSchedule) {
      if (!scheduleStartDate) {
        setSubmissionError("Please select a start date.");
        return;
      }
      if (!scheduleEndDate) {
        setSubmissionError("Please select an end date.");
        return;
      }

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
        setSubmissionError("End date must be the same as or after start date.");
        return;
      }

      startDate = scheduledStart;
      endDate = scheduledEnd;
    }

    const minBuffer = 5 * 60 * 1000;
    if (new Date(startDate).getTime() < Date.now() + minBuffer) {
      // If the provided start date is in the past or too close to now,
      // auto-correct it to 15 minutes in the future.
      startDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }

    const fallbackAgeMin = 18;
    const fallbackAgeMax = 45;
    const parsedMetaAgeMin = Number(metaAgeMin);
    const parsedMetaAgeMax = Number(metaAgeMax);
    const metaAgeMinValue = Number.isFinite(parsedMetaAgeMin)
      ? parsedMetaAgeMin
      : fallbackAgeMin;
    const metaAgeMaxValue = Number.isFinite(parsedMetaAgeMax)
      ? parsedMetaAgeMax
      : fallbackAgeMax;
    const ageMin = selectedPlatforms.meta ? metaAgeMinValue : fallbackAgeMin;
    const ageMax = selectedPlatforms.meta ? metaAgeMaxValue : fallbackAgeMax;
    const normalizedAgeMin = Math.max(13, Math.min(ageMin, ageMax));
    const normalizedAgeMax = Math.max(13, Math.max(ageMin, ageMax));

    const creatives = (
      Object.entries(creativesByPlatform) as Array<
        ["meta" | "tiktok", CreativeDraft]
      >
    )
      .filter(
        ([platform, value]) => Boolean(value) && selectedPlatforms[platform],
      )
      .map(([, c]) => c)
      .map((c) => ({
        primaryText: String(c?.primaryText ?? c?.subheading ?? ""),
        headline: String(c?.headline ?? c?.heading ?? ""),
        cta: String(c?.cta ?? "LEARN_MORE"),
        mediaUrl: String(c?.mediaUrl ?? c?.imageUrl ?? ""),
      }))
      .filter((c) => Boolean(c.mediaUrl));

    const payload: CreateCampaignPayload = {
      name: String(raw.campaignName ?? ""),
      goal: normalizeGoal(raw.campaignGoal),
      platforms: platforms as Array<"meta" | "tiktok">,
      targeting: {
        locations: uniqueLocations,
        ageMin: normalizedAgeMin,
        ageMax: normalizedAgeMax,
        gender: "all" as const,
        interests: uniqueInterests,
      },
      budget: {
        amount: budgetAmount,
        currency,
        type: budgetType,
        startDate,
        endDate,
      },
      creatives,
    };

    console.log("Create Campaign payload:", payload);

    try {
      setIsCreatingCampaign(true);

      const created = await createCampaign(payload);
      if (!created.id) {
        throw new Error("Created campaign did not return an ID");
      }

      sessionStorage.setItem(
        "pendingCampaign",
        JSON.stringify({
          id: created.id,
          name: payload.name,
          goal: payload.goal,
          platforms: payload.platforms,
          budget: payload.budget,
          targeting: payload.targeting,
          creatives: creativesByPlatform,
          totalReach: totalReach,
        }),
      );

      // Redirect to publish page
      window.location.href = "/panel/campaigns/new/publish";
    } catch (err) {
      console.error("Error creating campaign:", err);
      setSubmissionError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
      setIsCreatingCampaign(false);
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
        .replace(/\.[^/.]+$/, "") // strip extension
        .replace(/[^a-zA-Z0-9_-]/g, "_"); // replace unsafe chars
      const publicId = `${encryptedFolder.slice(0, 20)}/${safeName}_${Date.now()}`;

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
      console.log("Cloudinary upload result", uploadResult);

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
      console.log("Create audience response:", res);
      window.alert("Audience saved successfully.");
    } catch (err) {
      console.error("Save audience error:", err);
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
      console.log("Create combined audience response:", res);
      window.alert("Audience saved successfully.");
    } catch (err) {
      console.error("Save combined audience error:", err);
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
    // Apply countries
    if (audience.country && audience.country.length > 0) {
      const firstCountry = audience.country[0] as MetaSpecialAdLocationCode;
      setMetaCountries(audience.country as MetaSpecialAdLocationCode[]);
      setTiktokCountries(audience.country as MetaSpecialAdLocationCode[]);
    }

    // Apply locations
    if (audience.locations && audience.locations.length > 0) {
      setMetaLocations(audience.locations);
      setTiktokLocations(audience.locations);
    }

    // Apply interests
    if (audience.interests && audience.interests.length > 0) {
      setMetaInterests(audience.interests);
      setTiktokInterests(audience.interests);
    }

    // Apply Meta config
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

  return (
    <PanelLayout>
      <div className="flex h-full">
        {/* Secondary Sidebar */}
        <CampaignsSidebar />

        {/* Main Content */}
        <div className="h-full flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Page Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              New Campaign
            </h1>

            {/* Progress Tabs */}
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

            {/* New Campaign Form */}
            <form className="space-y-6" onSubmit={handleCreateCampaignSubmit}>
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
                      name="campaignName"
                      required
                      maxLength={100}
                      placeholder="Untitled Campaign"
                      className="mt-1 block w-full focus:border-b focus:border-khaki-200 focus:outline-none md:text-lg lg:text-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Set Campaign goal */}
              <GoalSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                campaignGoal={campaignGoal}
                setCampaignGoal={setCampaignGoal}
              />

              {/* Choose Platform */}
              <PlatformSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                setSelectedPlatforms={setSelectedPlatforms}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
              />

              {/* Target audience */}
              <AudienceSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                brandName={brandName}
                instagramAccountName={instagramAccountName}
                loadingAudiences={loadingAudiences}
                savedAudiences={savedAudiences}
                applyAudienceToForm={applyAudienceToForm}
                formatCountriesSummary={formatCountriesSummary}
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
                bothPlatformsConnected={bothPlatformsConnected}
                saveAudienceForPlatform={saveAudienceForPlatform}
                saveAudienceCombined={saveAudienceCombined}
                totalReach={totalReach}
              />

              {/* Budget */}
              <BudgetSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                currency={currency}
                setCurrency={setCurrency}
                CURRENCY_OPTIONS={CURRENCY_OPTIONS}
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

              {/* Setup Creative */}
              <CreativeSection
                progressTab={progressTab}
                setProgressTab={setProgressTab}
                selectedPlatforms={selectedPlatforms}
                creativesByPlatform={creativesByPlatform}
                openCreativeModal={openCreativeModal}
              />

              {/* Schedule toggle */}
              <div className="mt-2 flex items-center  gap-2 ">
                <div>
                  <p className="text-sm font-medium font-gilroy-bold">
                    Schedule campaign for later date
                  </p>
                </div>

                <Switch
                  checked={useSchedule}
                  className="data-[state=checked]:bg-khaki-200 data-[state=unchecked]:bg-gray-200 border border-peru-200"
                  onCheckedChange={(checked) => {
                    const next = Boolean(checked);
                    setUseSchedule(next);

                    if (next) {
                      const today = new Date();
                      const start = toDateInputValue(today);
                      const end = addDaysDateInputValue(start, 7);
                      setScheduleStartDate((prev) => prev || start);
                      setScheduleEndDate((prev) => prev || end);
                      setScheduleTime((prev) => prev || "09:00");
                    }
                  }}
                  aria-label="Schedule campaign for later date"
                />
              </div>

              {useSchedule && (
                <div className="bg-white rounded-xl p-4 border border-darkkhaki-200 flex gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-full border border-peru-200" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Schedule ad
                    </label>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        type="date"
                        value={scheduleStartDate}
                        onChange={(e) => setScheduleStartDate(e.target.value)}
                        aria-label="Start date"
                      />
                      <Input
                        type="date"
                        value={scheduleEndDate}
                        onChange={(e) => setScheduleEndDate(e.target.value)}
                        aria-label="End date"
                      />
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="text-peru-200"
                        aria-label="Time"
                      />
                    </div>
                  </div>
                </div>
              )}

              {submissionError && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {submissionError}
                </p>
              )}

              {/* create draft campaign btn */}
              <Button
                type="submit"
                disabled={isCreatingCampaign}
                className="w-full bg-khaki-200 hover:bg-khaki-300 text-black text-center cursor-pointer"
              >
                <CircleArrowRight />
                {isCreatingCampaign ? "Saving..." : "Save draft"}
              </Button>
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Image
                        </label>
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={handleBrowseClick}
                          className="mt-2 border-2 border-dashed border-[#B8A247] rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
                        >
                          <UploadCloud className="w-10 h-10 text-[#B8A247]" />
                          <p className="text-sm text-gray-600 mt-2">
                            Browse or drag and drop an image or video here
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Supported: JPG, PNG (max 10MB); MP4 (max 50MB)
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />

                          {uploadError && (
                            <div className="mt-2 text-xs text-red-600">
                              {uploadError}
                            </div>
                          )}
                        </div>

                        {creativePreview && (
                          <div className="mt-2">
                            {creativeImage?.type.startsWith("video/") ? (
                              <video
                                src={creativePreview}
                                controls
                                className="max-h-40 rounded-md"
                              />
                            ) : (
                              <img
                                src={creativePreview}
                                alt="preview"
                                className="max-h-40 rounded-md"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border-t flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCreativeModalOpen(false)}
                        disabled={isUploading}
                        className="px-4 py-2 border rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-4 py-2 bg-khaki-200 rounded-lg"
                      >
                        {isUploading
                          ? `Uploading ${uploadProgress}%`
                          : "Save creative"}
                      </button>
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
