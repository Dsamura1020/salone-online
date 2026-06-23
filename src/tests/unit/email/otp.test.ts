import { describe, expect, it } from "vitest";
import { generateOtp, hashOtp } from "@/lib/email/otp";

describe("generateOtp", () => {
  it("creates six digit codes", () => {
    expect(generateOtp()).toMatch(/^[0-9]{6}$/);
  });
});

describe("hashOtp", () => {
  it("hashes the same email and code consistently", () => {
    expect(hashOtp("USER@example.com", "123456")).toBe(
      hashOtp("user@example.com", "123456"),
    );
  });

  it("does not expose the original code", () => {
    expect(hashOtp("user@example.com", "123456")).not.toContain("123456");
  });
});
