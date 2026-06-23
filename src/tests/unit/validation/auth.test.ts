import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration payload", () => {
    const result = registerSchema.safeParse({
      accountType: "user",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane_doe",
      email: "jane@example.com",
      password: "securepass1",
      confirmPassword: "securepass1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid username characters", () => {
    const result = registerSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      username: "invalid user",
      email: "jane@example.com",
      password: "securepass1",
      confirmPassword: "securepass1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid business registration payload", () => {
    const result = registerSchema.safeParse({
      accountType: "business",
      firstName: "Mohamed",
      lastName: "Bangura",
      businessName: "Makeni Tech Hub",
      categoryName: "ICT Services",
      email: "owner@example.com",
      password: "securepass1",
      confirmPassword: "securepass1",
    });
    expect(result.success).toBe(true);
  });

  it("requires a password letter and number", () => {
    const result = registerSchema.safeParse({
      accountType: "user",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "securepass",
      confirmPassword: "securepass",
    });
    expect(result.success).toBe(false);
  });

  it("requires matching passwords", () => {
    const result = registerSchema.safeParse({
      accountType: "user",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "securepass1",
      confirmPassword: "securepass2",
    });
    expect(result.success).toBe(false);
  });
});
