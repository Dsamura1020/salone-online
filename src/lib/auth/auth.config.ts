import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma/prisma";
import { writeAuditLog } from "@/lib/audit/log";
import {
  OAUTH_INTENT_COOKIE,
  roleFromOauthIntent,
} from "@/lib/auth/oauth-intent";
import { loginSchema } from "@/lib/validation/auth";
import { normalizeEmail, slugify } from "@/lib/security/sanitize";

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

function splitName(name: string | null | undefined, email: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const fallback = email.split("@")[0] ?? "User";

  return {
    firstName: parts[0] ?? fallback,
    lastName: parts.slice(1).join(" ") || "Account",
  };
}

function authAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    async createUser(user: Omit<AdapterUser, "id">) {
      const email = user.email;
      const { firstName, lastName } = splitName(user.name, email);
      const username = await uniqueUsername(email.split("@")[0] ?? firstName);
      const cookieStore = await cookies();
      const selectedRole = roleFromOauthIntent(
        cookieStore.get(OAUTH_INTENT_COOKIE)?.value,
      );
      const defaultRole = await prisma.role.findUnique({
        where: { name: selectedRole },
      });

      const created = await prisma.user.create({
        data: {
          email,
          emailVerified: user.emailVerified ?? new Date(),
          name: user.name ?? `${firstName} ${lastName}`,
          firstName,
          lastName,
          username,
          image: user.image,
          roles: defaultRole
            ? {
                create: {
                  roleId: defaultRole.id,
                },
              }
            : undefined,
        },
      });

      await writeAuditLog({
        userId: created.id,
        entityType: "User",
        entityId: created.id,
        action: "OAUTH_USER_CREATED",
        newValues: { provider: "google", email, role: selectedRole },
      });

      return {
        id: created.id,
        email: created.email,
        emailVerified: created.emailVerified,
        name: created.name,
        image: created.image,
      };
    },
  };
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;
      const normalizedEmail = normalizeEmail(email);

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      if (
        !user?.passwordHash ||
        !user.isActive ||
        user.isSuspended ||
        !user.emailVerified
      ) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return null;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await writeAuditLog({
        userId: user.id,
        entityType: "User",
        entityId: user.id,
        action: "LOGIN_SUCCESS",
      });

      return {
        id: user.id,
        email: user.email,
        name:
          user.name ??
          `${user.firstName} ${user.lastName}`.trim(),
        image: user.image ?? undefined,
        username: user.username,
        roles: user.roles.map((ur) => ur.role.name),
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: authAdapter(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? "";
        token.roles = user.roles ?? [];
      }
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: { roles: { include: { role: true } } },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.roles = dbUser.roles.map((ur) => ur.role.name);
            token.name =
              dbUser.name ??
              `${dbUser.firstName} ${dbUser.lastName}`.trim();
            token.picture = dbUser.image;
          }
        } catch (error) {
          console.error("Could not refresh auth token from database", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.roles = token.roles;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};
