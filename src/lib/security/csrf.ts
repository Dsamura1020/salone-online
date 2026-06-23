import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const CSRF_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-salonebiz-csrf"
    : "salonebiz-csrf";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_BYTES = 32;

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return secret;
}

function signToken(token: string) {
  return createHmac("sha256", getSecret()).update(token).digest("hex");
}

function signedValue(token: string) {
  return `${token}.${signToken(token)}`;
}

function verifySignedValue(value: string | undefined, token: string) {
  if (!value) {
    return false;
  }

  const [cookieToken, signature] = value.split(".");
  if (!cookieToken || !signature || cookieToken !== token) {
    return false;
  }

  const expected = signToken(token);
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export function createCsrfToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function attachCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_COOKIE, signedValue(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function verifyCsrfToken(request: Request) {
  const token = request.headers.get(CSRF_HEADER);
  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CSRF_COOKIE)?.value;
  return verifySignedValue(cookieValue, token);
}

export const csrfHeaderName = CSRF_HEADER;
export const csrfCookieName = CSRF_COOKIE;
