import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/search/keyword-search", () => ({
  keywordSearch: vi.fn(),
}));

import { GET, POST } from "@/app/api/search/route";
import { keywordSearch } from "@/features/search/keyword-search";

const mockKeywordSearch = vi.mocked(keywordSearch);

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns search results for a valid query", async () => {
    mockKeywordSearch.mockResolvedValue({
      results: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          categoryId: "550e8400-e29b-41d4-a716-446655440010",
          locationId: "550e8400-e29b-41d4-a716-446655440020",
          businessName: "Acme Cafe",
          slug: "acme-cafe",
          description: "Specialty coffee in Freetown",
          categoryName: "Hospitality",
          location: "Freetown, Western Area, Sierra Leone",
          verificationStatus: "APPROVED",
          isVerified: true,
          rating: 4.7,
          reviewCount: 18,
          relevance: 0.92,
          recommendationScore: 0.84,
          personalizedScore: 0.89,
          url: "/businesses/acme-cafe",
        },
      ],
      total: 1,
      page: 1,
      limit: 5,
      hasMore: false,
    });

    const res = await GET(
      new Request("http://localhost/api/search?q=coffee&limit=5"),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.results).toHaveLength(1);
    expect(mockKeywordSearch).toHaveBeenCalledWith({
      q: "coffee",
      userId: undefined,
      categoryId: undefined,
      locationId: undefined,
      status: undefined,
      minRating: undefined,
      sort: "relevance",
      page: 1,
      limit: 5,
    });
  });

  it("returns browsable results when query and filters are missing", async () => {
    mockKeywordSearch.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
    });

    const res = await GET(new Request("http://localhost/api/search"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockKeywordSearch).toHaveBeenCalledWith({
      q: undefined,
      userId: undefined,
      categoryId: undefined,
      locationId: undefined,
      status: undefined,
      minRating: undefined,
      sort: "relevance",
      page: 1,
      limit: 10,
    });
  });

  it("supports filter-only searches", async () => {
    mockKeywordSearch.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
    });

    const res = await GET(
      new Request("http://localhost/api/search?status=APPROVED"),
    );

    expect(res.status).toBe(200);
    expect(mockKeywordSearch).toHaveBeenCalledWith({
      q: undefined,
      userId: undefined,
      categoryId: undefined,
      locationId: undefined,
      status: "APPROVED",
      minRating: undefined,
      sort: "relevance",
      page: 1,
      limit: 10,
    });
  });

  it("returns 500 when search throws", async () => {
    mockKeywordSearch.mockRejectedValue(
      new Error("Search backend unavailable"),
    );

    const res = await GET(
      new Request("http://localhost/api/search?q=test"),
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Search backend unavailable");
  });
});

describe("POST /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns search results for a valid body", async () => {
    mockKeywordSearch.mockResolvedValue({
      results: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          categoryId: "550e8400-e29b-41d4-a716-446655440011",
          locationId: "550e8400-e29b-41d4-a716-446655440021",
          businessName: "BlueWave Logistics",
          slug: "bluewave-logistics",
          description: "Shipping and logistics services",
          categoryName: "Transport",
          location: "Bo, Southern Province, Sierra Leone",
          verificationStatus: "APPROVED",
          isVerified: true,
          rating: 4.2,
          reviewCount: 11,
          relevance: 0.88,
          recommendationScore: 0.78,
          personalizedScore: 0.81,
          url: "/businesses/bluewave-logistics",
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      hasMore: false,
    });

    const res = await POST(
      new Request("http://localhost/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "logistics", limit: 10 }),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.results).toHaveLength(1);
    expect(mockKeywordSearch).toHaveBeenCalledWith({
      q: "logistics",
      userId: undefined,
      categoryId: undefined,
      locationId: undefined,
      status: undefined,
      minRating: undefined,
      sort: "relevance",
      page: 1,
      limit: 10,
    });
  });
});
