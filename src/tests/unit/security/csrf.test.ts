import { describe, expect, it } from "vitest";
import { createCsrfToken, csrfCookieName } from "@/lib/security/csrf";

describe("createCsrfToken", () => {
  it("creates high entropy url-safe tokens", () => {
    expect(createCsrfToken()).toMatch(/^[A-Za-z0-9_-]{40,}$/);
  });

  it("does not repeat tokens", () => {
    expect(createCsrfToken()).not.toBe(createCsrfToken());
  });

  it("uses a localhost-compatible cookie name outside production", () => {
    expect(csrfCookieName).toBe("salonebiz-csrf");
  });
});
