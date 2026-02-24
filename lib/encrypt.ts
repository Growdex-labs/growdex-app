import { CLOUDINARY_FOLDER } from "./constants";

export async function hashFolderName(folder: string = CLOUDINARY_FOLDER) {
  const encoder = new TextEncoder();
  const data = encoder.encode(folder);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
