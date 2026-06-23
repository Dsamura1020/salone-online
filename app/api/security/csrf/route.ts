import { NextResponse } from "next/server";
import { attachCsrfCookie, createCsrfToken } from "@/lib/security/csrf";

export function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({ success: true, data: { token } });
  attachCsrfCookie(response, token);
  return response;
}
