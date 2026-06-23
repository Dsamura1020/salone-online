import type { DashboardRole } from "@/features/users/services/dashboard-data";
import { displayRole } from "@/features/users/services/dashboard-data";

export function dashboardSubtitle(role: DashboardRole, activeView: string) {
  if (role === "admin") {
    if (activeView === "verification") {
      return "Review submitted businesses and approve or reject listings.";
    }
    if (activeView === "reviews") {
      return "Moderate flagged and pending reviews across the platform.";
    }

    return "Platform overview, verification queue, and review moderation.";
  }

  if (activeView === "settings") {
    return "Manage your account, avatar, and role preferences.";
  }
  if (role === "owner" && activeView === "businesses") {
    return "Manage your listings, status, and performance.";
  }
  if (role === "user" && (activeView === "saved" || activeView === "businesses")) {
    return "Your bookmarked businesses, ready when you need them.";
  }
  if (role === "owner") {
    return "Overview of your businesses, reviews, and platform activity.";
  }

  return "Discover and connect with verified businesses across Sierra Leone.";
}

export function dashboardTitle(role: DashboardRole, activeView: string) {
  if (role === "admin") {
    if (activeView === "verification") {
      return "Verification";
    }
    if (activeView === "reviews") {
      return "Review Moderation";
    }

    return "Admin Dashboard";
  }

  if (activeView === "settings") {
    return "Profile Settings";
  }
  if (role === "owner" && activeView === "businesses") {
    return "My Businesses";
  }
  if (role === "user" && (activeView === "saved" || activeView === "businesses")) {
    return "Saved Businesses";
  }
  if (activeView === "reviews") {
    return role === "owner" ? "Reviews" : "My Reviews";
  }
  if (activeView === "verification") {
    return "Verification";
  }

  return "Dashboard";
}

export function dashboardRoleLabel(role: DashboardRole) {
  return displayRole(role);
}
