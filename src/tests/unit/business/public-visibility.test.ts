import { describe, expect, it } from "vitest";
import {
  buildBusinessTextSearchWhere,
  publicBusinessWhere,
} from "@/lib/business/public-visibility";

describe("publicBusinessWhere", () => {
  it("requires approved verification status", () => {
    expect(publicBusinessWhere).toEqual({ verificationStatus: "APPROVED" });
  });
});

describe("buildBusinessTextSearchWhere", () => {
  it("matches each query token independently", () => {
    expect(buildBusinessTextSearchWhere("Makeni Soap")).toEqual({
      AND: [
        {
          OR: [
            { businessName: { contains: "Makeni", mode: "insensitive" } },
            { description: { contains: "Makeni", mode: "insensitive" } },
            {
              category: {
                name: { contains: "Makeni", mode: "insensitive" },
              },
            },
            {
              location: {
                city: { contains: "Makeni", mode: "insensitive" },
              },
            },
          ],
        },
        {
          OR: [
            { businessName: { contains: "Soap", mode: "insensitive" } },
            { description: { contains: "Soap", mode: "insensitive" } },
            {
              category: {
                name: { contains: "Soap", mode: "insensitive" },
              },
            },
            {
              location: {
                city: { contains: "Soap", mode: "insensitive" },
              },
            },
          ],
        },
      ],
    });
  });

  it("returns empty filter for blank query", () => {
    expect(buildBusinessTextSearchWhere("   ")).toEqual({});
  });
});
