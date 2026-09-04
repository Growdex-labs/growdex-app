import { apiFetch } from "@/lib/auth";
import { validateFile } from "@/lib/campaign-shared";
import { CLOUDINARY_FOLDER } from "@/lib/constants";
import { hashFolderName } from "@/lib/encrypt";

export type UploadedCreative = {
  url: string;
  name: string;
  mediaType: "image" | "video";
  thumbnailUrl?: string;
};

export async function uploadCreativeToCloudinary(
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<UploadedCreative> {
  onProgress?.(0);
  const validation = validateFile(file);
  if (!validation.ok) {
    throw new Error(validation.error ?? "Unsupported media file.");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error("Cloudinary is not configured.");

  const encryptedFolder = await hashFolderName();
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const publicId = `${encryptedFolder.slice(0, 20)}/${safeName}_${Date.now()}`;
  const signRes = await apiFetch("/media/signature-stamp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_id: publicId,
      folder: CLOUDINARY_FOLDER,
    }),
  });
  const signature = (await signRes.json().catch(() => ({}))) as {
    message?: string;
    api_key?: string;
    timestamp?: number;
    signature?: string;
  };
  if (!signRes.ok) {
    throw new Error(signature.message ?? "Could not authorize the upload.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", String(signature.api_key));
  body.append("timestamp", String(signature.timestamp));
  body.append("signature", String(signature.signature));
  body.append("public_id", publicId);
  body.append("folder", CLOUDINARY_FOLDER);

  const mediaType = file.type.startsWith("video/") ? "video" : "image";
  type UploadResponse = {
    secure_url?: string;
    thumbnail_url?: string;
    error?: { message?: string };
  };
  const uploaded = await new Promise<UploadResponse & { secure_url: string }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      const result = request.response as UploadResponse | null;
      if (request.status < 200 || request.status >= 300 || !result?.secure_url) {
        reject(new Error(result?.error?.message ?? "Media upload failed."));
        return;
      }
      onProgress?.(100);
      resolve({ ...result, secure_url: result.secure_url });
    };
    request.onerror = () => reject(new Error("Upload interrupted. Check your connection and try again."));
    request.onabort = () => reject(new Error("Upload cancelled."));
    request.ontimeout = () => reject(new Error("Upload timed out. Please try again."));
    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`);
    request.responseType = "json";
    request.timeout = 30 * 60 * 1000;
    request.send(body);
  });

  return {
    url: uploaded.secure_url,
    name: file.name.replace(/\.[^/.]+$/, "") || "Untitled creative",
    mediaType,
    thumbnailUrl: uploaded.thumbnail_url,
  };
}
