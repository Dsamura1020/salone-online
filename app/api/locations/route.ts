import { jsonOk } from "@/lib/api/response";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limitRaw = Number(searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(500, Math.floor(limitRaw)))
    : 100;

  const locations = await prisma.location.findMany({
    where: query
      ? {
          OR: [
            { city: { contains: query, mode: "insensitive" } },
            { stateProvince: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      city: true,
      stateProvince: true,
      country: true,
    },
    orderBy: [{ stateProvince: "asc" }, { city: "asc" }],
    take: limit,
  });

  return jsonOk(locations);
}
