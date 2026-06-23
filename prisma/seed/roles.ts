import type { PrismaClient } from "@prisma/client";

export const ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "BUSINESS_OWNER",
  "USER",
] as const;

export type SeedRoleName = (typeof ROLE_NAMES)[number];

export async function seedRoles(prisma: PrismaClient) {
  const descriptions: Record<SeedRoleName, string> = {
    SUPER_ADMIN: "Full platform access; can manage all admins and system data",
    ADMIN: "Administrative access for verification, reviews, and moderation",
    BUSINESS_OWNER: "Can create and manage owned business listings",
    USER: "Standard user; can browse, review, and rate businesses",
  };

  for (const name of ROLE_NAMES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: descriptions[name] },
    });
  }

  console.log(`  ✓ Roles (${ROLE_NAMES.length})`);
}
