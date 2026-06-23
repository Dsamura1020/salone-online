import bcrypt from "bcryptjs";
import { jsonError, jsonOk } from "@/lib/api/response";
import { prisma } from "@/lib/prisma/prisma";
import { ROLES } from "@/lib/auth/permissions";
import { registerSchema } from "@/lib/validation/auth";
import { createAndSendEmailOtp } from "@/lib/email/otp";
import { verifyCsrfToken } from "@/lib/security/csrf";
import {
  normalizeEmail,
  sanitizePlainText,
  slugify,
} from "@/lib/security/sanitize";

async function uniqueUsername(seed: string) {
  const base = slugify(seed).replace(/-/g, "_").slice(0, 24) || "user";
  let candidate = base;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}_${suffix}`.slice(0, 30);
    suffix++;
  }

  return candidate;
}

async function uniqueBusinessSlug(
  seed: string,
  findBusinessBySlug: (slug: string) => Promise<{ id: string } | null> =
    (slug) => prisma.business.findUnique({ where: { slug }, select: { id: true } }),
) {
  const base = slugify(seed);
  let candidate = base;
  let suffix = 1;

  while (await findBusinessBySlug(candidate)) {
    candidate = `${base}-${suffix}`.slice(0, 200);
    suffix++;
  }

  return candidate;
}

export async function POST(request: Request) {
  try {
    return await handleRegistration(request);
  } catch (error) {
    console.error("Registration failed", error);
    return jsonError("Could not create account. Please try again.", 500);
  }
}

async function handleRegistration(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return jsonError("Invalid security token", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const email = normalizeEmail(parsed.data.email);
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const existing = await prisma.user.findFirst({
    where: { email },
  });

  if (existing) {
    return jsonError("Email already in use", 409);
  }

  const roleName =
    parsed.data.accountType === "business" ? ROLES.BUSINESS_OWNER : ROLES.USER;

  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    return jsonError("Default roles are not configured. Run db:seed.", 500);
  }

  const username =
    parsed.data.accountType === "user" && parsed.data.username
      ? await uniqueUsername(parsed.data.username)
      : await uniqueUsername(email.split("@")[0] ?? "user");

  const result = await prisma.$transaction(async (tx) => {
    const firstName = sanitizePlainText(parsed.data.firstName);
    const lastName = sanitizePlainText(parsed.data.lastName);
    const fullName = `${firstName} ${lastName}`.trim();

    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        phone: parsed.data.phone
          ? sanitizePlainText(parsed.data.phone)
          : undefined,
        passwordHash,
        name: fullName,
        roles: {
          create: { roleId: role.id },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    let businessId: string | null = null;

    if (parsed.data.accountType === "business") {
      const categorySlug = slugify(parsed.data.categoryName);
      const category = await tx.businessCategory.upsert({
        where: { slug: categorySlug },
        update: { name: sanitizePlainText(parsed.data.categoryName) },
        create: {
          name: sanitizePlainText(parsed.data.categoryName),
          slug: categorySlug,
        },
      });

      let location = await tx.location.findFirst({
        where: { country: "Sierra Leone", city: "Freetown" },
      });

      location ??= await tx.location.create({
        data: {
          country: "Sierra Leone",
          stateProvince: "Western Area",
          city: "Freetown",
          district: "Western Area Urban",
          addressLine1: "Pending business address",
        },
      });

      const business = await tx.business.create({
        data: {
          ownerId: user.id,
          categoryId: category.id,
          locationId: location.id,
          businessName: sanitizePlainText(parsed.data.businessName),
          slug: await uniqueBusinessSlug(
            parsed.data.businessName,
            (slug) => tx.business.findUnique({ where: { slug }, select: { id: true } }),
          ),
          email,
          phone: parsed.data.phone
            ? sanitizePlainText(parsed.data.phone)
            : undefined,
          isPublished: false,
          verificationStatus: "PENDING",
        },
        select: { id: true },
      });

      businessId = business.id;
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        entityType: "User",
        entityId: user.id,
        action: "REGISTER_PENDING_EMAIL_VERIFICATION",
        newValues: {
          accountType: parsed.data.accountType,
          email,
          businessId,
        },
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    });

    return { user, businessId };
  });

  try {
    await createAndSendEmailOtp(email);
  } catch {
    return jsonError(
      "Account created, but we could not send the verification code. Please try resending it.",
      503,
    );
  }

  return jsonOk(
    {
      email: result.user.email,
      username: result.user.username,
      businessId: result.businessId,
      requiresOtp: true,
    },
    201,
  );
}
