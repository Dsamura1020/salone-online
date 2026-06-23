export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  BUSINESS_OWNER: "BUSINESS_OWNER",
  USER: "USER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export function hasRole(roles: string[] | undefined, role: RoleName): boolean {
  return roles?.includes(role) ?? false;
}

/** Platform administrators (verification queue, review moderation, admin UI) */
export function isAdmin(roles: string[] | undefined): boolean {
  return (
    hasRole(roles, ROLES.ADMIN) || hasRole(roles, ROLES.SUPER_ADMIN)
  );
}

export function isSuperAdmin(roles: string[] | undefined): boolean {
  return hasRole(roles, ROLES.SUPER_ADMIN);
}
