import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

type SeedUserConfig = {
  key: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  roleNames: string[];
};

function env(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

export async function seedUsers(prisma: PrismaClient) {
  const users: SeedUserConfig[] = [
    {
      key: "super_admin",
      firstName: "Super",
      lastName: "Admin",
      username: env("SUPER_ADMIN_USERNAME", "superadmin"),
      email: env("SUPER_ADMIN_EMAIL", "superadmin@example.com"),
      password: env("SUPER_ADMIN_PASSWORD", "SuperAdmin123!@#"),
      roleNames: ["SUPER_ADMIN"],
    },
    {
      key: "admin",
      firstName: "System",
      lastName: "Admin",
      username: env("ADMIN_USERNAME", "admin"),
      email: env("ADMIN_EMAIL", "samuradanielsalifu@gmail.com"),
      password: env("ADMIN_PASSWORD", "SaloneOnline@2026$$"),
      roleNames: ["ADMIN"],
    },
    {
      key: "business_owner",
      firstName: "Demo",
      lastName: "Owner",
      username: env("OWNER_USERNAME", "owner"),
      email: env("OWNER_EMAIL", "owner@example.com"),
      password: env("OWNER_PASSWORD", "Owner123!@#"),
      roleNames: ["BUSINESS_OWNER", "USER"],
    },
    {
      key: "user",
      firstName: "Demo",
      lastName: "User",
      username: env("USER_USERNAME", "user"),
      email: env("USER_EMAIL", "user@example.com"),
      password: env("USER_PASSWORD", "User123!@#"),
      roleNames: ["USER"],
    },
  ];

  for (const userConfig of users) {
    const roles = await prisma.role.findMany({
      where: { name: { in: userConfig.roleNames } },
    });

    if (roles.length !== userConfig.roleNames.length) {
      throw new Error(
        `Missing roles for ${userConfig.key}. Run seedRoles first.`,
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: userConfig.email },
    });

    if (existing) {
      for (const role of roles) {
        await prisma.userRole.upsert({
          where: {
            userId_roleId: { userId: existing.id, roleId: role.id },
          },
          update: {},
          create: {
            userId: existing.id,
            roleId: role.id,
          },
        });
      }

      console.log(
        `  ✓ User ${userConfig.key}: ${userConfig.email} (existing — left unchanged, roles synced)`,
      );
      continue;
    }

    const passwordHash = await bcrypt.hash(userConfig.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        username: userConfig.username,
        email: userConfig.email,
        passwordHash,
        name: `${userConfig.firstName} ${userConfig.lastName}`,
        emailVerified: new Date(),
        isActive: true,
      },
    });

    for (const role of roles) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    console.log(
      `  ✓ User ${userConfig.key}: ${userConfig.email} (${userConfig.roleNames.join(", ")})`,
    );
  }
}
