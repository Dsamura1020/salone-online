import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { toCSV } from "@/utils/csv";

type ExportType = "businesses" | "users" | "reviews";

const VALID_TYPES = new Set<string>(["businesses", "users", "reviews"]);

function todayString() {
  return new Date().toISOString().slice(0, 10);
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
  const exportType: ExportType = VALID_TYPES.has(typeParam)
    ? (typeParam as ExportType)
    : "businesses";

  let rows: Record<string, unknown>[] = [];

  if (exportType === "businesses") {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        businessName: true,
        slug: true,
        verificationStatus: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        category: { select: { name: true } },
        location: { select: { city: true, district: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    rows = businesses.map((b) => ({
      id: b.id,
      businessName: b.businessName,
      slug: b.slug,
      verificationStatus: b.verificationStatus,
      averageRating: Number(b.averageRating).toFixed(2),
      reviewCount: b.reviewCount,
      category: b.category?.name ?? "",
      city: b.location?.city ?? "",
      district: b.location?.district ?? "",
      createdAt: b.createdAt.toISOString(),
    }));
  } else if (exportType === "users") {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    rows = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      roles: u.roles.map((ur) => ur.role.name).join("|"),
      createdAt: u.createdAt.toISOString(),
    }));
  } else {
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        moderationStatus: true,
        createdAt: true,
        user: { select: { email: true } },
        business: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    rows = reviews.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      moderationStatus: r.moderationStatus,
      authorEmail: r.user?.email ?? "guest",
      businessName: r.business.businessName,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  const csv = toCSV(rows);
  const filename = `saloneonline-${exportType}-${todayString()}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
