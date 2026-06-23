import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";
import { ROLES, type RoleName } from "@/lib/auth/permissions";

export const OAUTH_INTENT_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-salonebiz-oauth-role"
    : "salonebiz-oauth-role";

const OAUTH_INTENT_MAX_AGE_SECONDS = 10 * 60;

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return secret;
}

function signRole(role: RoleName) {
  return createHmac("sha256", getSecret()).update(role).digest("hex");
}

function signedValue(role: RoleName) {
  return `${role}.${signRole(role)}`;
}

export function roleFromOauthIntent(value: string | undefined): RoleName {
  if (!value) {
    return ROLES.USER;
  }

  const [role, signature] = value.split(".");
  if (
    role !== ROLES.USER &&
    role !== ROLES.BUSINESS_OWNER
  ) {
    return ROLES.USER;
  }

  const expected = Buffer.from(signRole(role), "hex");
  const actual = Buffer.from(signature ?? "", "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return ROLES.USER;
  }

  return role;
}

export function attachOauthIntentCookie(response: NextResponse, role: RoleName) {
  response.cookies.set(OAUTH_INTENT_COOKIE, signedValue(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OAUTH_INTENT_MAX_AGE_SECONDS,
  });
}
