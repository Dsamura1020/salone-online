import { randomUUID } from "node:crypto";
import { slugify } from "@/lib/security/sanitize";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadValidationResult =
  | {
      valid: true;
      safeFileName: string;
      contentType: string;
      size: number;
    }
  | {
      valid: false;
      error: string;
    };

export function validateUploadFile(file: {
  name: string;
  size: number;
  type: string;
}): UploadValidationResult {
  if (file.size <= 0) {
    return { valid: false, error: "File is empty" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { valid: false, error: "File must be 5MB or smaller" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: "Unsupported file type" };
  }

  const extension = EXTENSIONS[file.type];
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ""));

  return {
    valid: true,
    safeFileName: `${baseName}-${randomUUID()}.${extension}`,
    contentType: file.type,
    size: file.size,
  };
}

export { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES };
