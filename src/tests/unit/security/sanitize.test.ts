import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  normalizeEmail,
  sanitizePlainText,
  slugify,
} from "@/lib/security/sanitize";

describe("sanitizePlainText", () => {
  it("trims and removes control characters", () => {
    expect(sanitizePlainText("  Hello\u0000 world\u0007  ")).toBe("Hello world");
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims email addresses", () => {
    expect(normalizeEmail(" USER@Example.COM ")).toBe("user@example.com");
  });
});

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Makeni Tech Hub!")).toBe("makeni-tech-hub");
  });
});

describe("escapeHtml", () => {
  it("escapes dangerous HTML characters", () => {
    expect(escapeHtml("<script>alert('x')</script>")).toBe(
      "&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;",
    );
  });
});
