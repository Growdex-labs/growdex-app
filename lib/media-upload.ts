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
): Promise<UploadedCreative> {
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
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`,
    { method: "POST", body },
  );
  const uploaded = (await uploadRes.json().catch(() => ({}))) as {
    secure_url?: string;
    thumbnail_url?: string;
    error?: { message?: string };
  };
  if (!uploadRes.ok || !uploaded.secure_url) {
    throw new Error(uploaded.error?.message ?? "Media upload failed.");
  }

  return {
    url: uploaded.secure_url,
    name: file.name.replace(/\.[^/.]+$/, "") || "Untitled creative",
    mediaType,
    thumbnailUrl: uploaded.thumbnail_url,
  };
}
