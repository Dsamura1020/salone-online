import type { PrismaClient } from "@prisma/client";
import {
  NATIONAL_CATEGORIES,
  NATIONAL_CATEGORY_SUBCATEGORIES,
  REGIONAL_CATEGORY_SPECIALTIES,
} from "./data/regional-categories.data";
import { SL_REGIONS } from "./data/us-regions";

function regionalParentSlug(regionSlug: string) {
  return `region-${regionSlug}`;
}

export async function seedCategories(prisma: PrismaClient) {
  // Seed the 5 national parent categories
  for (const category of NATIONAL_CATEGORIES) {
    const existing = await prisma.businessCategory.findUnique({
      where: { slug: category.slug },
    });

    if (existing) {
      continue;
    }

    await prisma.businessCategory.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
  }

  // Seed subcategories (keywords) under each national parent
  for (const category of NATIONAL_CATEGORIES) {
    const parent = await prisma.businessCategory.findUnique({
      where: { slug: category.slug },
    });

    if (!parent) {
      continue;
    }

    const subcategories = NATIONAL_CATEGORY_SUBCATEGORIES[category.slug] ?? [];

    for (const sub of subcategories) {
      const existingSub = await prisma.businessCategory.findUnique({
        where: { slug: sub.slug },
      });

      if (existingSub) {
        continue;
      }

      await prisma.businessCategory.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentCategoryId: parent.id,
        },
      });
    }
  }

  // Seed Sierra Leone regional parent categories and their specialties
  for (const region of SL_REGIONS) {
    const parentSlug = regionalParentSlug(region.slug);
    const parentName = `${region.name} — Regional Industries`;

    let parent = await prisma.businessCategory.findUnique({
      where: { slug: parentSlug },
    });

    if (!parent) {
      parent = await prisma.businessCategory.create({
        data: {
          name: parentName,
          slug: parentSlug,
          description: region.description,
        },
      });
    }

    const specialties = REGIONAL_CATEGORY_SPECIALTIES[region.slug];
    for (const specialty of specialties) {
      const childSlug = `${region.slug}-${specialty.slug}`;
      const existingChild = await prisma.businessCategory.findUnique({
        where: { slug: childSlug },
      });

      if (existingChild) {
        continue;
      }

      await prisma.businessCategory.create({
        data: {
          name: specialty.name,
          slug: childSlug,
          description: specialty.description,
          parentCategoryId: parent.id,
        },
      });
    }
  }

  const nationalCount = NATIONAL_CATEGORIES.length;
  const nationalSubCount = Object.values(NATIONAL_CATEGORY_SUBCATEGORIES).flat().length;
  const regionalParentCount = SL_REGIONS.length;
  const regionalChildCount = Object.values(REGIONAL_CATEGORY_SPECIALTIES).flat().length;

  console.log(
    `  ✓ Categories (${nationalCount} national + ${nationalSubCount} national subcategories + ${regionalParentCount} regional parents + ${regionalChildCount} regional specialties)`,
  );
}
