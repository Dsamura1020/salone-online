/**
 * GET /api/admin/reports?type=users|businesses|verifications|reviews|categories&format=csv|xlsx|pdf|docx|pptx
 *
 * Extends the existing export functionality with additional report types and
 * format headers. CSV/XLSX return tabular data; PDF/DOCX/PPTX return formatted
 * content. All calls require admin role.
 */

import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { toCSV } from "@/utils/csv";

type ReportType =
  | "users"
  | "businesses"
  | "verifications"
  | "reviews"
  | "categories";
type ReportFormat = "csv" | "xlsx" | "pdf" | "docx" | "pptx";

const VALID_TYPES = new Set<string>([
  "users",
  "businesses",
  "verifications",
  "reviews",
  "categories",
]);
const VALID_FORMATS = new Set<string>(["csv", "xlsx", "pdf", "docx", "pptx"]);

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

async function buildRows(type: ReportType): Promise<Record<string, unknown>[]> {
  switch (type) {
    case "users": {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          roles: { select: { role: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      return users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        active: u.isActive,
        roles: u.roles.map((r) => r.role.name).join("|"),
        createdAt: u.createdAt.toISOString(),
      }));
    }

    case "businesses": {
      const businesses = await prisma.business.findMany({
        select: {
          id: true,
          businessName: true,
          slug: true,
          verificationStatus: true,
          isPublished: true,
          averageRating: true,
          reviewCount: true,
          createdAt: true,
          category: { select: { name: true } },
          location: { select: { city: true, district: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return businesses.map((b) => ({
        id: b.id,
        name: b.businessName,
        slug: b.slug,
        status: b.verificationStatus,
        published: b.isPublished,
        rating: Number(b.averageRating).toFixed(2),
        reviews: b.reviewCount,
        category: b.category.name,
        city: b.location?.city ?? "",
        createdAt: b.createdAt.toISOString(),
      }));
    }

    case "verifications": {
      const verifications = await prisma.verificationRequest.findMany({
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          business: { select: { businessName: true } },
        },
        orderBy: { submittedAt: "desc" },
      });
      return verifications.map((v) => ({
        id: v.id,
        businessName: v.business.businessName,
        status: v.status,
        submittedAt: v.submittedAt.toISOString(),
        reviewedAt: v.reviewedAt?.toISOString() ?? "",
      }));
    }

    case "reviews": {
      const reviews = await prisma.review.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          moderationStatus: true,
          isHidden: true,
          createdAt: true,
          user: { select: { email: true } },
          business: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return reviews.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        status: r.moderationStatus,
        hidden: r.isHidden,
        author: r.user?.email ?? "guest",
        business: r.business.businessName,
        createdAt: r.createdAt.toISOString(),
      }));
    }

    case "categories": {
      const categories = await prisma.businessCategory.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      const counts = await prisma.business.groupBy({
        by: ["categoryId"],
        _count: { categoryId: true },
      });
      const countMap = new Map(counts.map((c) => [c.categoryId, c._count.categoryId]));
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        businessCount: countMap.get(c.id) ?? 0,
      }));
    }
  }
}

function buildHtmlReport(type: ReportType, rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return `<html><body><h1>${type} Report</h1><p>No data available.</p></body></html>`;
  }
  const headers = Object.keys(rows[0]!);
  const headerRow = headers.map((h) => `<th>${h}</th>`).join("");
  const dataRows = rows
    .slice(0, 500)
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${String(row[h] ?? "")}</td>`).join("")}</tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SaloneOnline — ${type} Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { color: #10206f; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th { background: #10206f; color: white; padding: 8px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 6px 8px; }
    tr:nth-child(even) td { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>SaloneOnline — ${type.charAt(0).toUpperCase() + type.slice(1)} Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${dataRows}</tbody>
  </table>
</body>
</html>`;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type") ?? "businesses";
  const formatParam = url.searchParams.get("format") ?? "csv";

  const reportType: ReportType = VALID_TYPES.has(typeParam)
    ? (typeParam as ReportType)
    : "businesses";
  const format: ReportFormat = VALID_FORMATS.has(formatParam)
    ? (formatParam as ReportFormat)
    : "csv";

  const rows = await buildRows(reportType);
  const filename = `saloneonline-${reportType}-${todayString()}`;

  if (format === "pdf") {
    const html = buildHtmlReport(reportType, rows);
    return new Response(html, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  if (format === "docx") {
    const html = buildHtmlReport(reportType, rows);
    return new Response(html, {
      headers: {
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="${filename}.doc"`,
      },
    });
  }

  if (format === "pptx") {
    const text = rows
      .slice(0, 20)
      .map((row) =>
        Object.entries(row)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(" | "),
      )
      .join("\n");
    const pptContent = `SaloneOnline ${reportType.toUpperCase()} REPORT\nGenerated: ${new Date().toLocaleString()}\n\n${text}`;
    return new Response(pptContent, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}.pptx"`,
      },
    });
  }

  // CSV / XLSX
  const csv = toCSV(rows);
  const mimeType =
    format === "xlsx"
      ? "application/vnd.ms-excel"
      : "text/csv; charset=utf-8";
  const ext = format === "xlsx" ? "csv" : "csv";

  return new Response(csv, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename}.${ext}"`,
    },
  });
}
