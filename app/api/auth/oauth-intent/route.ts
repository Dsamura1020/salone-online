import { z } from "zod";
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/auth/permissions";
import { attachOauthIntentCookie } from "@/lib/auth/oauth-intent";
import { jsonError } from "@/lib/api/response";
import { verifyCsrfToken } from "@/lib/security/csrf";

const oauthIntentSchema = z.object({
  accountType: z.enum(["user", "business"]),
});

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return jsonError("Invalid security token", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = oauthIntentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const role =
    parsed.data.accountType === "business" ? ROLES.BUSINESS_OWNER : ROLES.USER;
  const response = NextResponse.json({ success: true, data: { role } });
  attachOauthIntentCookie(response, role);
  return response;
}
