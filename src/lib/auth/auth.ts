import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isAdmin, type RoleName } from "@/lib/auth/permissions";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function requireRole(role: RoleName) {
  const session = await requireAuth();
  if (!session) {
    return null;
  }
  if (!session.user.roles.includes(role)) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session || !isAdmin(session.user.roles)) {
    return null;
  }
  return session;
}
