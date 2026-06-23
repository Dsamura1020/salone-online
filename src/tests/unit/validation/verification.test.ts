import { describe, expect, it } from "vitest";
import {
  submitVerificationSchema,
  verificationDecisionSchema,
  verificationListQuerySchema,
} from "@/lib/validation/verification";

const businessId = "550e8400-e29b-41d4-a716-446655440000";

describe("verification validation", () => {
  it("submitVerificationSchema requires a UUID businessId", () => {
    expect(
      submitVerificationSchema.safeParse({ businessId }).success,
    ).toBe(true);
    expect(
      submitVerificationSchema.safeParse({ businessId: "not-uuid" }).success,
    ).toBe(false);
  });

  it("verificationDecisionSchema accepts APPROVED with optional comments", () => {
    const result = verificationDecisionSchema.safeParse({
      decision: "APPROVED",
      comments: "Looks good",
    });
    expect(result.success).toBe(true);
  });

  it("verificationListQuerySchema coerces page and applies defaults", () => {
    const result = verificationListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }

    const withPage = verificationListQuerySchema.safeParse({ page: "2" });
    expect(withPage.success).toBe(true);
    if (withPage.success) {
      expect(withPage.data.page).toBe(2);
    }
  });
});
