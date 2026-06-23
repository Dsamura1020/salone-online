import { describe, expect, it } from "vitest";
import {
  getDisplayVerificationStatus,
  mapDisplayStatusToBadgeStatus,
} from "@/repositories/business.repository";

describe("getDisplayVerificationStatus", () => {
  it("returns Incomplete when no verification request exists", () => {
    expect(getDisplayVerificationStatus("PENDING", false)).toBe("Incomplete");
  });

  it("returns Pending review when submitted and awaiting admin action", () => {
    expect(getDisplayVerificationStatus("PENDING", true)).toBe("Pending review");
  });

  it("returns Under review when admin is reviewing", () => {
    expect(getDisplayVerificationStatus("UNDER_REVIEW", true)).toBe(
      "Under review",
    );
  });

  it("returns Approved for approved businesses", () => {
    expect(getDisplayVerificationStatus("APPROVED", true)).toBe("Approved");
  });

  it("returns Rejected for rejected businesses", () => {
    expect(getDisplayVerificationStatus("REJECTED", true)).toBe("Rejected");
  });
});

describe("mapDisplayStatusToBadgeStatus", () => {
  it("maps display statuses to owner badge statuses", () => {
    expect(mapDisplayStatusToBadgeStatus("Approved")).toBe("verified");
    expect(mapDisplayStatusToBadgeStatus("Incomplete")).toBe("incomplete");
    expect(mapDisplayStatusToBadgeStatus("Pending review")).toBe(
      "pending_review",
    );
    expect(mapDisplayStatusToBadgeStatus("Under review")).toBe(
      "pending_review",
    );
    expect(mapDisplayStatusToBadgeStatus("Rejected")).toBe("rejected");
  });
});
