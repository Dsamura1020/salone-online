import { describe, expect, it } from "vitest";
import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  validateUploadFile,
} from "@/lib/security/uploads";

describe("validateUploadFile", () => {
  it("accepts known safe document types", () => {
    const result = validateUploadFile({
      name: "Business License.pdf",
      size: 1024,
      type: "application/pdf",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.safeFileName).toMatch(/^business-license-.+\.pdf$/);
    }
  });

  it("rejects executable-looking uploads by mime type", () => {
    const result = validateUploadFile({
      name: "payload.js",
      size: 100,
      type: "application/javascript",
    });

    expect(result).toEqual({ valid: false, error: "Unsupported file type" });
  });

  it("rejects oversized uploads", () => {
    const result = validateUploadFile({
      name: "large.pdf",
      size: MAX_UPLOAD_BYTES + 1,
      type: "application/pdf",
    });

    expect(result).toEqual({
      valid: false,
      error: "File must be 5MB or smaller",
    });
  });

  it("keeps the allowed mime list intentionally small", () => {
    expect([...ALLOWED_MIME_TYPES]).toEqual([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });
});
