export type CreativeDraft = {
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
  mediaType?: "image" | "video";
};

export type FormObject = Record<
  string,
  FormDataEntryValue | FormDataEntryValue[]
>;

export type SignatureStampPayload = {
  signature?: string;
  timestamp?: number | string;
  api_key?: string;
  apiKey?: string;
};

export type SignatureStampResponse = SignatureStampPayload & {
  data?: SignatureStampPayload;
};

export type CloudinaryUploadResponse = {
  secure_url?: string;
  url?: string;
} & Record<string, unknown>;

export const validateFile = (file: File): { ok: boolean; error?: string } => {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    return {
      ok: false,
      error: "Unsupported file type. Upload an image or a video.",
    };
  }

  const maxImage = 10 * 1024 * 1024; // 10MB
  const maxVideo = 100 * 1024 * 1024; // 100MB

  if (isImage && file.size > maxImage) {
    return { ok: false, error: "Image is too large. Max 10 MB." };
  }

  if (isVideo && file.size > maxVideo) {
    return { ok: false, error: "Video is too large. Max 100 MB." };
  }

  return { ok: true };
};

export const validateTikTokVideoFile = async (file: File): Promise<void> => {
  const validation = validateFile(file);
  if (!validation.ok) throw new Error(validation.error);
  if (!/\.(mp4|mov|mpeg|avi)$/i.test(file.name)) throw new Error("TikTok videos must use MP4, MOV, MPEG, or AVI format.");
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const video = document.createElement("video");
      const cleanup = () => { window.clearTimeout(timeout); video.onloadedmetadata = null; video.onerror = null; video.removeAttribute("src"); video.load(); };
      const timeout = window.setTimeout(() => { cleanup(); reject(new Error("Could not inspect this video. Export an MP4 video and try again.")); }, 15_000);
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const { videoWidth: width, videoHeight: height, duration } = video;
        cleanup();
        const ratio = width / height;
        const portrait = Math.abs(ratio - 9 / 16) < 0.02 && width >= 540 && height >= 960;
        const landscape = Math.abs(ratio - 16 / 9) < 0.02 && width >= 960 && height >= 540;
        const square = Math.abs(ratio - 1) < 0.02 && width >= 640 && height >= 640;
        if (!Number.isFinite(duration) || duration <= 0) reject(new Error("This video has no readable duration. Export it again before uploading."));
        else if (duration > 600) reject(new Error("Uploaded TikTok ad videos must be no longer than 10 minutes."));
        else if (!portrait && !landscape && !square) reject(new Error("Use a 9:16 video of at least 540×960, a 16:9 video of at least 960×540, or a square video of at least 640×640."));
        else resolve();
      };
      video.onerror = () => { cleanup(); reject(new Error("Your browser cannot read this video. Export an MP4 video and try again.")); };
      video.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const toDateInputValue = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const isVideoUrl = (url: string) => {
  const u = String(url ?? "");
  if (!u) return false;
  if (u.includes("/video/upload/")) return true;
  return /\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i.test(u);
};

export const isImageUrl = (url: string) => {
  const u = String(url ?? "");
  if (!u) return false;
  if (u.includes("/image/upload/")) return true;
  return /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/i.test(u);
};

export const isVideoMedia = ({
  url,
  platform,
  mediaType,
}: {
  url: string;
  platform?: "meta" | "tiktok" | "both";
  mediaType?: string | null;
}) => {
  const normalizedType = mediaType?.toLowerCase();
  if (normalizedType === "image") return false;
  if (normalizedType === "video") return true;
  if (isVideoUrl(url)) return true;
  if (isImageUrl(url)) return false;
  return platform === "tiktok" && Boolean(url);
};

export const startOfUtcDayIso = (d: Date) =>
  new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  ).toISOString();

export const addDaysDateInputValue = (dateValue: string, days: number) => {
  const base = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(base.getTime())) return dateValue;
  base.setDate(base.getDate() + days);
  return toDateInputValue(base);
};
