import { describe, expect, it } from "vitest";
import { ROLES, hasRole, isAdmin } from "@/lib/auth/permissions";

describe("auth roles", () => {
  it("hasRole returns true when role is present", () => {
    expect(hasRole(["USER", "ADMIN"], ROLES.ADMIN)).toBe(true);
  });

  it("hasRole returns false for undefined roles", () => {
    expect(hasRole(undefined, ROLES.ADMIN)).toBe(false);
  });

  it("isAdmin includes ADMIN and SUPER_ADMIN", () => {
    expect(isAdmin(["ADMIN"])).toBe(true);
    expect(isAdmin(["SUPER_ADMIN"])).toBe(true);
    expect(isAdmin(["BUSINESS_OWNER", "USER"])).toBe(false);
  });
});
