import { describe, expect, it } from "vitest";
import { buildBusinessSearchText } from "@/lib/business/search-text";

describe("buildBusinessSearchText", () => {
  it("joins business fields with newlines", () => {
    const text = buildBusinessSearchText({
      businessName: "Acme Cafe",
      description: "Specialty coffee",
      category: { name: "Food & Drink" },
      location: {
        city: "Austin",
        stateProvince: "TX",
        country: "USA",
      },
    });

    expect(text).toContain("Acme Cafe");
    expect(text).toContain("Specialty coffee");
    expect(text).toContain("Food & Drink");
    expect(text).toContain("Austin, TX, USA");
  });

  it("omits null optional fields", () => {
    const text = buildBusinessSearchText({
      businessName: "Solo Shop",
      description: null,
    });

    expect(text).toBe("Solo Shop");
  });
});
