import { jsonOk } from "@/lib/api/response";
import { getPopularCategoryOptions } from "@/lib/landing/popular-categories";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("popular") === "true") {
    const categories = await getPopularCategoryOptions();
    return jsonOk(categories);
  }

  const categories = await prisma.businessCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentCategoryId: true,
      parentCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ parentCategoryId: "asc" }, { name: "asc" }],
  });

  return jsonOk(categories);
}
