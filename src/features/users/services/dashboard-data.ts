import type { Session } from "next-auth";
import type { RoleName } from "@/lib/auth/permissions";
import { ROLES } from "@/lib/auth/permissions";

export type DashboardRole = "owner" | "user" | "admin";

export type DashboardUser = {
  name: string;
  email: string;
  initials: string;
  imageUrl?: string | null;
  role: DashboardRole;
  accountRoleLabel: "Owner" | "Admin" | "User";
};

export type BusinessSummary = {
  id: string;
  slug?: string;
  imageUrl?: string;
  name: string;
  initials: string;
  category: string;
  location: string;
  status: "verified" | "pending_review" | "incomplete" | "rejected";
  views: string;
  leads: string;
  rating: string;
  reviewCount: string;
  description: string;
};

export type SavedBusiness = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  category: string;
  location: string;
  rating: string;
  reviewCount: string;
  description: string;
  isVerified: boolean;
  imageUrl?: string;
};

const fallbackOwnerBusinesses: BusinessSummary[] = [
  {
    id: "makeni-tech-hub",
    name: "Makeni Tech Hub",
    initials: "MT",
    category: "Technology Services",
    location: "Makeni",
    status: "verified",
    views: "2,350",
    leads: "98",
    rating: "4.8",
    reviewCount: "112",
    description:
      "A trusted technology business focused on software development, digital support, and local training.",
  },
  {
    id: "salone-fresh-foods",
    name: "Salone Fresh Foods",
    initials: "SA",
    category: "Retail",
    location: "Freetown",
    status: "pending_review",
    views: "1,420",
    leads: "51",
    rating: "4.2",
    reviewCount: "74",
    description:
      "Fresh groceries, produce, and everyday supplies for homes and offices across Freetown.",
  },
  {
    id: "smartcare-pharmacy",
    name: "SmartCare Pharmacy",
    initials: "SM",
    category: "Health",
    location: "Bo",
    status: "verified",
    views: "1,980",
    leads: "72",
    rating: "4.6",
    reviewCount: "89",
    description:
      "Community pharmacy offering prescriptions, consultations, and health essentials.",
  },
  {
    id: "edubridge-learning",
    name: "EduBridge Learning",
    initials: "ED",
    category: "Education",
    location: "Kenema",
    status: "verified",
    views: "1,130",
    leads: "39",
    rating: "4.5",
    reviewCount: "66",
    description:
      "Learning support and tutoring programs for students and young professionals.",
  },
];

export function dashboardRoleFromRoles(roles: string[] | undefined): DashboardRole {
  if (roles?.includes(ROLES.ADMIN) || roles?.includes(ROLES.SUPER_ADMIN)) {
    return "admin";
  }

  return roles?.includes(ROLES.BUSINESS_OWNER) ? "owner" : "user";
}

export function displayRole(role: DashboardRole) {
  if (role === "admin") {
    return "Administrator";
  }

  return role === "owner" ? "Business Owner" : "Member";
}

export function accountRoleLabelFromRoles(
  roles: string[] | undefined,
): DashboardUser["accountRoleLabel"] {
  if (roles?.includes(ROLES.ADMIN) || roles?.includes(ROLES.SUPER_ADMIN)) {
    return "Admin";
  }
  if (roles?.includes(ROLES.BUSINESS_OWNER)) {
    return "Owner";
  }

  return "User";
}

export function initialsFromName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "U";
  const second = words[1]?.[0] ?? words[0]?.[1] ?? "";

  return `${first}${second}`.toUpperCase();
}

export function dashboardUserFromSession(session: Session): DashboardUser {
  const name =
    session.user.name ??
    session.user.email?.split("@")[0] ??
    session.user.username ??
    "SaloneOnline User";
  const email = session.user.email ?? "account@saloneonline.sl";
  const role = dashboardRoleFromRoles(session.user.roles);

  return {
    name,
    email,
    role,
    accountRoleLabel: accountRoleLabelFromRoles(session.user.roles),
    initials: initialsFromName(name),
    imageUrl: session.user.image,
  };
}

export function hasDashboardRole(
  roles: string[] | undefined,
  role: RoleName,
) {
  return roles?.includes(role) ?? false;
}

export function fallbackBusinesses() {
  return fallbackOwnerBusinesses;
}

export function businessInitials(name: string) {
  const cleanWords = name.split(/\s+/).filter(Boolean);
  return (
    `${cleanWords[0]?.[0] ?? "B"}${cleanWords[1]?.[0] ?? cleanWords[0]?.[1] ?? ""}`
      .toUpperCase()
      .slice(0, 2)
  );
}
