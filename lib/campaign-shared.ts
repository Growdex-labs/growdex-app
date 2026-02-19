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
  const maxVideo = 50 * 1024 * 1024; // 50MB

  if (isImage && file.size > maxImage) {
    return { ok: false, error: "Image is too large. Max 10 MB." };
  }

  if (isVideo && file.size > maxVideo) {
    return { ok: false, error: "Video is too large. Max 50 MB." };
  }

  return { ok: true };
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

export default {};
