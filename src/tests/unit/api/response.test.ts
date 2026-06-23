import { describe, expect, it } from "vitest";
import { jsonError, jsonOk } from "@/lib/api/response";

describe("API response helpers", () => {
  it("jsonOk wraps data with success flag", async () => {
    const res = jsonOk({ id: "1" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { id: "1" } });
  });

  it("jsonOk supports custom status", async () => {
    const res = jsonOk({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it("jsonError returns error message", async () => {
    const res = jsonError("Bad request", 400);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: "Bad request" });
    expect(res.status).toBe(400);
  });
});
