import { prisma } from "@/lib/prisma/prisma";

function toSlugPart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeBusinessSlug(nameOrSlug: string) {
  return toSlugPart(nameOrSlug).slice(0, 200);
}

export async function generateUniqueBusinessSlug(
  nameOrSlug: string,
  excludeBusinessId?: string,
) {
  const base = normalizeBusinessSlug(nameOrSlug);
  const fallbackBase = base.length > 0 ? base : "business";

  const existing = await prisma.business.findFirst({
    where: {
      slug: fallbackBase,
      ...(excludeBusinessId
        ? {
            id: {
              not: excludeBusinessId,
            },
          }
        : {}),
    },
    select: { id: true },
  });

  if (!existing) {
    return fallbackBase;
  }

  let suffix = 2;
  while (suffix < 10_000) {
    const candidate = `${fallbackBase}-${suffix}`;
    const duplicate = await prisma.business.findFirst({
      where: {
        slug: candidate,
        ...(excludeBusinessId
          ? {
              id: {
                not: excludeBusinessId,
              },
            }
          : {}),
      },
      select: { id: true },
    });
    if (!duplicate) {
      return candidate;
    }
    suffix++;
  }

  throw new Error("Could not generate a unique business slug");
}
