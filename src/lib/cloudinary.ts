/**
 * Direct uploads to Cloudinary (unsigned preset). Files are not stored in Firebase Storage.
 *
 * Env (Next.js public):
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 * - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  (unsigned upload preset in Cloudinary dashboard)
 */

export type CloudinaryUploadResult = {
  secureUrl: string;
  resourceType: string;
  bytes: number;
  originalFilename?: string;
  deleteToken?: string;
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);
  body.append("return_delete_token", "true");

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const resourceEndpoint = isPdf ? "raw" : "image";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceEndpoint}/upload`,
    {
      method: "POST",
      body,
    }
  );

  const json = (await res.json()) as {
    secure_url?: string;
    resource_type?: string;
    bytes?: number;
    original_filename?: string;
    delete_token?: string;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(json.error?.message || res.statusText || "Upload failed");
  }

  if (!json.secure_url) {
    throw new Error("Upload response missing URL");
  }

  return {
    secureUrl: json.secure_url,
    resourceType: json.resource_type || resourceEndpoint,
    bytes: json.bytes ?? file.size,
    originalFilename: json.original_filename,
    deleteToken: json.delete_token,
  };
}

export async function deleteFromCloudinaryByToken(deleteToken: string): Promise<void> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.");
  }

  const body = new FormData();
  body.append("token", deleteToken);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, {
    method: "POST",
    body,
  });

  const json = (await res.json()) as { result?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message || res.statusText || "Cloudinary delete failed");
  }
}

/** Guess attachment type for Firestore from MIME / Cloudinary resource type */
export function attachmentTypeFromFile(file: File): "image" | "pdf" {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  return "image";
}

export function attachmentTypeFromUrl(url: string, resourceType?: string): "image" | "pdf" {
  if (resourceType === "image") return "image";
  if (resourceType === "raw" || /\.pdf($|\?)/i.test(url)) return "pdf";
  return "image";
}
