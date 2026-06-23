import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma/prisma";
import { escapeHtml, normalizeEmail } from "@/lib/security/sanitize";

const OTP_TTL_MINUTES = 10;
const OTP_IDENTIFIER_PREFIX = "email-verification:";
const PASSWORD_CHANGE_IDENTIFIER_PREFIX = "password-change:";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return secret;
}

export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

export function hashOtp(email: string, otp: string) {
  return createHmac("sha256", getSecret())
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest("hex");
}

function identifiers(email: string, prefix = OTP_IDENTIFIER_PREFIX) {
  return `${prefix}${normalizeEmail(email)}`;
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

async function sendOtpEmail({
  email,
  otp,
  subject,
  heading,
  intro,
}: {
  email: string;
  otp: string;
  subject: string;
  heading: string;
  intro: string;
}) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

  if (!emailUser || !emailPass) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`SaloneOnline code for ${email}: ${otp}`);
      return;
    }
    throw new Error("Email delivery is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: `"SaloneOnline" <${emailUser}>`,
    to: email,
    subject,
    text: `${intro} ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #08101f;">
        <h1 style="font-size: 22px;">${escapeHtml(heading)}</h1>
        <p>${escapeHtml(intro)}</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${escapeHtml(otp)}</p>
        <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>
      </div>
    `,
  });
}

export async function createAndSendEmailOtp(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const otp = generateOtp();
  const identifier = identifiers(normalizedEmail);
  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashOtp(normalizedEmail, otp),
      expires,
    },
  });

  await sendOtpEmail({
    email: normalizedEmail,
    otp,
    subject: "Verify your SaloneOnline account",
    heading: "Verify your SaloneOnline account",
    intro: "Your six-digit verification code is:",
  });
}

export async function verifyEmailOtp(email: string, otp: string) {
  const normalizedEmail = normalizeEmail(email);
  const identifier = identifiers(normalizedEmail);
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      expires: { gt: new Date() },
    },
  });

  if (!token) {
    return false;
  }

  const valid = safeCompare(token.token, hashOtp(normalizedEmail, otp));
  if (!valid) {
    return false;
  }

  await prisma.verificationToken.delete({
    where: { token: token.token },
  });

  return true;
}

export async function createAndSendPasswordChangeOtp(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const otp = generateOtp();
  const identifier = identifiers(normalizedEmail, PASSWORD_CHANGE_IDENTIFIER_PREFIX);
  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashOtp(normalizedEmail, otp),
      expires,
    },
  });

  await sendOtpEmail({
    email: normalizedEmail,
    otp,
    subject: "Change your SaloneOnline password",
    heading: "Change your SaloneOnline password",
    intro: "Use this six-digit code to change your password:",
  });
}

export async function verifyPasswordChangeOtp(email: string, otp: string) {
  const normalizedEmail = normalizeEmail(email);
  const identifier = identifiers(normalizedEmail, PASSWORD_CHANGE_IDENTIFIER_PREFIX);
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      expires: { gt: new Date() },
    },
  });

  if (!token) {
    return false;
  }

  const valid = safeCompare(token.token, hashOtp(normalizedEmail, otp));
  if (!valid) {
    return false;
  }

  await prisma.verificationToken.delete({
    where: { token: token.token },
  });

  return true;
}
