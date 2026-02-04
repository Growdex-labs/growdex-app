"use client";

import { useState, useRef } from "react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/auth";
import { createCampaign, type BudgetType, type CampaignGoal } from "@/lib/campaigns";
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

export default function NewCampaignPage() {
  const [progressTab, setProgressTab] = useState<number>(0);

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

  const [currency, setCurrency] = useState("NGN");
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
    Partial<Record<"meta" | "tiktok", any>>
  >({});

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

      // keep at least one country selected
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

  const formDataToObject = (fd: FormData) => {
    const obj: Record<string, any> = {};
    for (const [key, value] of fd.entries()) {
      if (key in obj) {
        obj[key] = Array.isArray(obj[key])
          ? [...obj[key], value]
          : [obj[key], value];
      } else {
        obj[key] = value;
      }
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

    const budgetAmountMeta = selectedPlatforms.meta
      ? Number(metaBudgetAmount || 0)
      : 0;
    const budgetAmountTiktok = selectedPlatforms.tiktok
      ? Number(tiktokBudgetAmount || 0)
      : 0;
    const budgetAmount =
      (Number.isFinite(budgetAmountMeta) ? budgetAmountMeta : 0) +
      (Number.isFinite(budgetAmountTiktok) ? budgetAmountTiktok : 0);

    const budgetType: BudgetType = (() => {
      const types: BudgetType[] = [];
      if (selectedPlatforms.meta) types.push(metaBudgetFrequency);
      if (selectedPlatforms.tiktok) types.push(tiktokBudgetFrequency);

      if (types.includes("lifetime")) return "lifetime";
      return "daily";
    })();

    const startDate = startOfUtcDayIso(new Date());
    const endDate = addDaysUtcIso(startDate, 7);

    const creatives = (Object.entries(creativesByPlatform) as Array<
      ["meta" | "tiktok", any]
    >)
      .filter(([platform, value]) => Boolean(value) && selectedPlatforms[platform])
      .map(([, c]) => c)
      .map((c: any) => ({
        primaryText: String(c?.primaryText ?? c?.subheading ?? ""),
        headline: String(c?.headline ?? c?.heading ?? ""),
        cta: String(c?.cta ?? "LEARN_MORE"),
        mediaUrl: String(c?.mediaUrl ?? c?.imageUrl ?? ""),
      }))
      .filter((c) => Boolean(c.mediaUrl));

    const payload = {
      name: String(raw.campaignName ?? ""),
      goal: normalizeGoal(raw.campaignGoal),
      platforms: platforms as Array<"meta" | "tiktok">,
      targeting: {
        locations: uniqueLocations,
        ageMin: 18,
        ageMax: 45,
        gender: "all" as const,
        interests: [],
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
      const data = await createCampaign(payload);
      console.log("Create Campaign response:", data);
    } catch (err) {
      console.error("Create Campaign error:", err);
      setSubmissionError(err instanceof Error ? err.message : "Create failed");
    } finally {
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

      const CLOUDINARY_FOLDER = "growdex_campaigns";
      const publicId = process.env.NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID;
      if (!publicId) {
        setUploadError(
          "Missing NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID. Please set it in your environment.",
        );
        return;
      }

      const confirmed = window.confirm(
        "Once you upload this creative, it will be saved to Cloudinary and you won’t be able to edit it. To make changes later, you’ll need to upload a new creative.\n\nDo you want to continue?",
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

      const signJson: any = await signRes.json().catch(() => ({}));
      const signPayload = signJson?.data ?? signJson;

      const signature = signPayload?.signature;
      const timestamp = signPayload?.timestamp;
      const api_key = signPayload?.api_key ?? signPayload?.apiKey;
      const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!signature || !timestamp || !api_key || !cloud_name) {
        throw new Error(
          `Signature response missing required fields. Received: ${JSON.stringify(
            signJson,
          )}`,
        );
      }

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
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 0
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                } bg-[url('/campaign-goal.png')] bg-contain`}
                style={{
                  backgroundPosition: "right, bottom",
                  backgroundRepeat: "no-repeat",
                }}
                onClick={() => setProgressTab(0)}
              >
                <div className="flex gap-3 items-center">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-36 border border-peru-200" />
                    </div>
                    <div>
                      <label
                        htmlFor="campaignGoal"
                        className="block text-sm font-medium text-gray-500"
                      >
                        Set Campaign goal
                      </label>
                      {/* radio group */}
                      <div className="flex flex-col mt-1 gap-3">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="awareness"
                            className="form-radio"
                          />
                          <span className="ml-2">Awareness</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="traffic"
                            className="form-radio"
                          />
                          <span className="ml-2">Traffic</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="conversions"
                            className="form-radio"
                          />
                          <span className="ml-2">Conversions</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="sales"
                            className="form-radio"
                          />
                          <span className="ml-2">Sales</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="leads"
                            className="form-radio"
                          />
                          <span className="ml-2">Leads</span>
                        </label>
                      </div>
                      <div className="bg-gray-50 p-2 mt-4 w-fit">
                        <ul className="list-disc list-inside">
                          <li>
                            <small className="font-gilroy-bold">
                              Show your ad to as many people as possible to
                              increase brand visibility and reach.
                            </small>
                          </li>
                        </ul>
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
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-32 border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Choose platform
                      </label>
                      <p className="mt-2 font-gilroy-medium text-gray-500">
                        What platforms are you running this ad on?{" "}
                        <span className="ml-2 hover:underline text-peru-200 cursor-pointer">
                          Connect new account
                        </span>
                      </p>

                      {/* Platform Cards */}
                      <div className="flex mt-4 gap-4">
                        {/* Meta Card */}
                        <label
                          htmlFor="meta"
                          className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
                        >
                          <Checkbox
                            id="meta"
                            checked={selectedPlatforms.meta}
                            onCheckedChange={(checked) =>
                              setSelectedPlatforms((prev) => ({
                                ...prev,
                                meta: Boolean(checked),
                              }))
                            }
                            className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                          />

                          {/* Meta Logo */}
                          <img
                            src="/logos_meta-icon.png"
                            alt="meta"
                            className="mt-2"
                          />

                          {/* Facebook Account */}
                          <div className="mb-3 border-r pr-2 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <div className="p-1 bg-gray-600 rounded-full">
                                <Facebook className="w-4 h-4 text-white" />
                              </div>
                              <span>Growdex Limited</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <PluggedIcon fill="#0A883F" />
                              <span className="text-xs text-green-600 font-medium">
                                Connected
                              </span>
                            </div>
                          </div>

                          {/* Instagram Account */}
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <InstagramIcon className="w-4 h-4 text-gray-500" />
                              <span>Growdex_Limited</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                              >
                                <PluggedOutIcon />
                                Connect
                              </button>
                            </div>
                          </div>
                        </label>

                        {/* TikTok Card */}
                        <label
                          htmlFor="tiktok"
                          className="inline-flex items-start gap-2 cursor-pointer group flex-1 mt-2 bg-mintcream-50 p-2 rounded-xl"
                        >
                          <Checkbox
                            id="tiktok"
                            checked={selectedPlatforms.tiktok}
                            onCheckedChange={(checked) =>
                              setSelectedPlatforms((prev) => ({
                                ...prev,
                                tiktok: Boolean(checked),
                              }))
                            }
                            className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                          />

                          <div className="flex gap-2 items-center">
                            {/* TikTok Logo */}
                            <img
                              src="/logos_tiktok-icon.png"
                              alt="tiktok-icon"
                            />

                            {/* TikTok Account */}
                            <div className="flex flex-col gap-2 items-start">
                              <p className="text-sm font-medium text-gray-700">
                                <span>Grow with Growdex</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <PluggedIcon fill="#0A883F" />
                                <span className="text-xs text-green-600 font-medium">
                                  Connected
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target audience */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 2
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(2)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-full border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Target audience
                      </label>
                      <p className="mt-2 font-gilroy-medium text-gray-500">
                        Select the audience you want to reach{" "}
                        <small className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer">
                          <SparklesIcon className="w-4 h-4" /> optimize with AI
                        </small>
                      </p>

                      {/* Audience reach cards */}
                      <div className="w-full flex flex-col gap-2 mt-4">
                        {/* Meta Card */}
                        <div className="rounded-4xl border p-3 space-y-2">
                          <div>
                            <p className="text-gray-400">Total reach</p>
                            <h4 className="text-xl md:text-2xl">
                              25,000 - 50,000k
                            </h4>
                          </div>
                          <div className="w-full inline-flex items-start justify-between gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl">
                            <div className="flex gap-4">
                              {/* Meta Logo */}
                              <img
                                src="/logos_meta-icon.png"
                                alt="meta"
                                className="mt-2"
                              />

                              {/* Facebook Account */}
                              <div className="mb-3 border-r pr-2 mt-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <div className="p-1 bg-gray-600 rounded-full">
                                    <Facebook className="w-4 h-4 text-white" />
                                  </div>
                                  <span>Growdex Limited</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <PluggedIcon fill="#0A883F" />
                                  <span className="text-xs text-green-600 font-medium">
                                    Connected
                                  </span>
                                </div>
                              </div>

                              {/* Instagram Account */}
                              <div className="mt-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <InstagramIcon className="w-4 h-4 text-gray-500" />
                                  <span>Growdex_Limited</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    type="button"
                                    className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                                  >
                                    <PluggedOutIcon />
                                    Connect
                                  </button>
                                </div>
                              </div>
                            </div>
                            <small className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer text-right">
                              <div className="p-1 bg-dimYellow rounded-lg">
                                <Users className="w-4 h-4" />
                              </div>
                              Use saved audience
                              <ChevronDown className="w-4 h-4" />
                            </small>
                          </div>

                          {/* country & age cards */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* country */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Country</p>
                              <div className="border-b inline-flex items-center justify-between w-full pb-2 gap-2">
                                <div className="flex-1">
                                  <p className="text-gray-400">
                                    {formatCountriesSummary(metaCountries)}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-peru-200"
                                    >
                                      Change country
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-72 max-h-72">
                                    <DropdownMenuLabel>
                                      Countries
                                    </DropdownMenuLabel>
                                    {COUNTRY_OPTIONS.map(({ code, name }) => (
                                      <DropdownMenuCheckboxItem
                                        key={code}
                                        checked={metaCountries.includes(code)}
                                        onCheckedChange={(checked) =>
                                          toggleCountry(
                                            "meta",
                                            code,
                                            Boolean(checked),
                                          )
                                        }
                                      >
                                        {name}
                                      </DropdownMenuCheckboxItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-2">
                                <InputGroup className="bg-white">
                                  <InputGroupInput
                                    placeholder="Search for city or state"
                                    value={metaLocationQuery}
                                    onChange={(e) =>
                                      setMetaLocationQuery(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addLocationTag(
                                          "meta",
                                          metaLocationQuery,
                                        );
                                      }
                                    }}
                                  />
                                  <InputGroupAddon>
                                    <Search />
                                  </InputGroupAddon>
                                </InputGroup>
                                {/* city/state tags */}
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  {metaLocations.map((location) => (
                                    <div
                                      key={location}
                                      className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                                    >
                                      <button
                                        type="button"
                                        className="text-xs font-medium text-gray-700"
                                        aria-label={`Remove ${location}`}
                                        onClick={() =>
                                          removeLocationTag("meta", location)
                                        }
                                      >
                                        &times;
                                      </button>
                                      <p className="text-xs font-medium text-gray-700">
                                        {location}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {/* age */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Age</p>
                              <p className="text-gray-400">
                                Set the audience age
                              </p>
                              <div className="mt-2 flex flex-col gap-2">
                                <label
                                  htmlFor="meta-age1"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="meta-age1"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">18-25</span>
                                </label>
                                <label
                                  htmlFor="meta-age2"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="meta-age2"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">25-30</span>
                                </label>
                                <label
                                  htmlFor="meta-age3"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="meta-age3"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">30-65</span>
                                </label>
                                <label
                                  htmlFor="meta-age4"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="meta-age4"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">65-80</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* category card */}
                          <div className="p-2 bg-gray-50 rounded-xl">
                            <p>Core Interest Categories</p>
                            <p className="text-gray-400">
                              Broad and sub-interests inferred from user
                              activity and profile data.
                            </p>
                            <hr className="my-4" />
                            <div>
                              <InputGroup className="bg-white">
                                <InputGroupInput placeholder="Search for category" />
                                <InputGroupAddon>
                                  <Search />
                                </InputGroupAddon>
                              </InputGroup>
                              {/* city/state tags */}
                              <div className="mt-2 flex gap-2">
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Marketing
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Management
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Education
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Health
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black"
                          >
                            Save audience
                          </Button>
                        </div>

                        {/* Tiktok Card */}
                        <div className="rounded-4xl border p-3 space-y-2">
                          <div className="w-full inline-flex items-start justify-between gap-2 cursor-pointer group bg-mintcream-50 p-2 rounded-xl">
                            <div className="flex gap-2 items-center">
                              {/* TikTok Logo */}
                              <img
                                src="/logos_tiktok-icon.png"
                                alt="tiktok-icon"
                              />

                              {/* TikTok Account */}
                              <div className="flex flex-col gap-2 items-start">
                                <p className="text-sm font-medium text-gray-700">
                                  <span>Grow with Growdex</span>
                                </p>
                                <div className="flex items-center gap-2">
                                  <PluggedIcon fill="#0A883F" />
                                  <span className="text-xs text-green-600 font-medium">
                                    Connected
                                  </span>
                                </div>
                              </div>
                            </div>
                            <small className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer">
                              <div className="p-1 bg-dimYellow rounded-lg">
                                <Users className="w-4 h-4" />
                              </div>
                              Use saved audience
                              <ChevronDown className="w-4 h-4" />
                            </small>
                          </div>

                          {/* country & age cards */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* country */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Country</p>
                              <div className="border-b inline-flex items-center justify-between w-full pb-2 gap-2">
                                <div className="flex-1">
                                  <p className="text-gray-400">
                                    {formatCountriesSummary(tiktokCountries)}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-peru-200"
                                    >
                                      Change country
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-72 max-h-72">
                                    <DropdownMenuLabel>
                                      Countries
                                    </DropdownMenuLabel>
                                    {COUNTRY_OPTIONS.map(({ code, name }) => (
                                      <DropdownMenuCheckboxItem
                                        key={code}
                                        checked={tiktokCountries.includes(code)}
                                        onCheckedChange={(checked) =>
                                          toggleCountry(
                                            "tiktok",
                                            code,
                                            Boolean(checked),
                                          )
                                        }
                                      >
                                        {name}
                                      </DropdownMenuCheckboxItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-2">
                                <InputGroup className="bg-white">
                                  <InputGroupInput
                                    placeholder="Search for city or state"
                                    value={tiktokLocationQuery}
                                    onChange={(e) =>
                                      setTiktokLocationQuery(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addLocationTag(
                                          "tiktok",
                                          tiktokLocationQuery,
                                        );
                                      }
                                    }}
                                  />
                                  <InputGroupAddon>
                                    <Search />
                                  </InputGroupAddon>
                                </InputGroup>
                                {/* city/state tags */}
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  {tiktokLocations.map((location) => (
                                    <div
                                      key={location}
                                      className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                                    >
                                      <button
                                        type="button"
                                        className="text-xs font-medium text-gray-700"
                                        aria-label={`Remove ${location}`}
                                        onClick={() =>
                                          removeLocationTag("tiktok", location)
                                        }
                                      >
                                        &times;
                                      </button>
                                      <p className="text-xs font-medium text-gray-700">
                                        {location}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {/* age */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Age</p>
                              <p className="text-gray-400">
                                Set the audience age
                              </p>
                              <div className="mt-2 flex flex-col gap-2">
                                <label
                                  htmlFor="tiktok-age1"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="tiktok-age1"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">18-25</span>
                                </label>
                                <label
                                  htmlFor="tiktok-age2"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="tiktok-age2"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">25-30</span>
                                </label>
                                <label
                                  htmlFor="tiktok-age3"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="tiktok-age3"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">30-65</span>
                                </label>
                                <label
                                  htmlFor="tiktok-age4"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="tiktok-age4"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">65-80</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* category card */}
                          <div className="p-2 bg-gray-50 rounded-xl">
                            <p>Core Interest Categories</p>
                            <p className="text-gray-400">
                              Broad and sub-interests inferred from user
                              activity and profile data.
                            </p>
                            <hr className="my-4" />
                            <div>
                              <InputGroup className="bg-white">
                                <InputGroupInput placeholder="Search for category" />
                                <InputGroupAddon>
                                  <Search />
                                </InputGroupAddon>
                              </InputGroup>
                              {/* city/state tags */}
                              <div className="mt-2 flex gap-2">
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Marketing
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Management
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Education
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Health
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black"
                          >
                            Save audience
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 3
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(3)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-32 border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Budget
                      </label>
                      <div className="flex items-center justify-between font-gilroy-medium">
                        <p className="mt-2 text-gray-500">
                          How much do you want to spend?
                        </p>
                        <p className="ml-2 hover:underline text-peru-200 cursor-pointer">
                          Select Budget
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-gray-500">Currency</p>
                        <div className="w-40">
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Currency</SelectLabel>
                                {CURRENCY_OPTIONS.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Platform budgets */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {/* Meta Card */}
                        <label
                          htmlFor="meta"
                          className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
                        >
                          {/* Meta Logo */}
                          <img
                            src="/logos_meta-icon.png"
                            alt="meta"
                            className="mt-2"
                          />

                          {/* Meta Freq */}
                          <div className="mb-3 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <span>Growdex Limited</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input
                                name="metaBudgetAmount"
                                type="number"
                                min={0}
                                step={0.01}
                                value={metaBudgetAmount}
                                onChange={(e) =>
                                  setMetaBudgetAmount(e.target.value)
                                }
                                placeholder="Amount"
                              />
                              <Select
                                value={metaBudgetFrequency}
                                onValueChange={(v) =>
                                  setMetaBudgetFrequency(
                                    v as "daily" | "lifetime",
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Frequency</SelectLabel>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="lifetime">
                                      Lifetime
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-gray-500">
                              Reach: 25,000 - 70,000
                            </p>
                          </div>
                        </label>
                        <label
                          htmlFor="meta"
                          className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
                        >
                          {/* Tiktok Logo */}
                          <img
                            src="/logos_tiktok-icon.png"
                            alt="meta"
                            className="mt-2"
                          />

                          {/* Tiktok Freq */}
                          <div className="mb-3 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <span>Grow with Growdex</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input
                                name="tiktokBudgetAmount"
                                type="number"
                                min={0}
                                step={0.01}
                                value={tiktokBudgetAmount}
                                onChange={(e) =>
                                  setTiktokBudgetAmount(e.target.value)
                                }
                                placeholder="Amount"
                              />
                              <Select
                                value={tiktokBudgetFrequency}
                                onValueChange={(v) =>
                                  setTiktokBudgetFrequency(
                                    v as "daily" | "lifetime",
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Frequency</SelectLabel>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="lifetime">
                                      Lifetime
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-gray-500">
                              Reach: 25,000 - 70,000
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Setup Creative */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 4
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(4)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-full border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Setup Creative
                      </label>

                      {/* Creative cards */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {/* Meta Creative */}
                        <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                          <div className="flex justify-between gap-2 px-2">
                            <div className="flex gap-2">
                              <img
                                src="/logos_meta-icon.png"
                                alt="meta-icon"
                                className="h-11"
                              />
                              <div>
                                <p>Header</p>
                                <p>Subhead</p>
                              </div>
                            </div>
                            <MoreVerticalIcon />
                          </div>
                          <img src="/media-creative.png" alt="media" />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              className="bg-khaki-200 hover:bg-khaki-300 text-black"
                              onClick={() => openCreativeModal("meta")}
                            >
                              Add creative
                            </Button>
                          </div>
                        </div>
                        {/* Tiktok Creative */}
                        <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                          <div className="flex justify-between gap-2 px-2">
                            <div className="flex gap-2">
                              <img
                                src="/logos_tiktok-icon.png"
                                alt="tiktok-icon"
                                className="h-11"
                              />
                              <div>
                                <p>Header</p>
                                <p>Subhead</p>
                              </div>
                            </div>
                            <MoreVerticalIcon />
                          </div>
                          <img src="/media-creative.png" alt="media" />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              className="bg-khaki-200 hover:bg-khaki-300 text-black"
                              onClick={() => openCreativeModal("tiktok")}
                            >
                              Add creative
                            </Button>
                          </div>
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

              {/* create campaign btn */}
              <Button
                type="submit"
                disabled={isCreatingCampaign}
                className="w-full bg-khaki-200 hover:bg-khaki-300 text-black text-center cursor-pointer"
              >
                <CircleArrowRight />
                {isCreatingCampaign ? "Creating..." : "Create campaign"}
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
