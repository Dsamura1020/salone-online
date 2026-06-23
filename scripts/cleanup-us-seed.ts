import "dotenv/config";
import { createSeedPrisma } from "../prisma/seed/lib/prisma";

const GROUP_A_SLUGS = [
  "northeast-financial-services",
  "northeast-legal-services",
  "northeast-biotech-pharma",
  "northeast-maritime-ports",
  "northeast-higher-education",
  "southeast-tourism-hospitality",
  "southeast-agriculture-agribusiness",
  "southeast-construction-development",
  "southeast-logistics-distribution",
  "southeast-textiles-apparel",
  "midwest-manufacturing",
  "midwest-food-processing",
  "midwest-transportation-rail",
  "midwest-agriculture-equipment",
  "midwest-insurance-finance",
  "southwest-energy-utilities",
  "southwest-oil-gas",
  "southwest-border-trade",
  "southwest-ranching-livestock",
  "southwest-aerospace-defense",
  "west-software-saas",
  "west-entertainment-media",
  "west-wine-viticulture",
  "west-outdoor-recreation",
  "west-clean-technology",
];

const GROUP_B_SLUGS = [
  "region-northeast",
  "region-southeast",
  "region-midwest",
  "region-southwest",
  "region-west",
];

const GROUP_C_SLUGS = [
  "restaurants-food",
  "retail-shopping",
  "health-medical",
  "professional-services",
  "home-local-services",
  "automotive",
  "real-estate",
  "education-training",
  "entertainment-recreation",
  "technology",
];

async function deleteCategories(
  prisma: ReturnType<typeof createSeedPrisma>,
  slugs: string[],
  usedCategoryIds: Set<string>,
  groupLabel: string,
): Promise<{ deleted: number; skipped: { id: string; slug: string }[] }> {
  const rows = await prisma.businessCategory.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });

  const safeToDelete = rows.filter((r) => !usedCategoryIds.has(r.id));
  const skipped = rows.filter((r) => usedCategoryIds.has(r.id));

  if (safeToDelete.length > 0) {
    await prisma.businessCategory.deleteMany({
      where: { id: { in: safeToDelete.map((r) => r.id) } },
    });
  }

  console.log(
    `  ${groupLabel} — ${safeToDelete.length} deleted, ${skipped.length} skipped`,
  );

  return { deleted: safeToDelete.length, skipped };
}

const prisma = createSeedPrisma();

async function main() {
  console.log("\nCollecting business references…");

  const businesses = await prisma.business.findMany({
    select: { locationId: true, categoryId: true },
  });

  const usedLocationIds = new Set(businesses.map((b) => b.locationId));
  const usedCategoryIds = new Set(businesses.map((b) => b.categoryId));

  console.log(
    `  Found ${businesses.length} business(es) — protecting their locations and categories.\n`,
  );

  // ── Locations ──────────────────────────────────────────────────────────────

  console.log("Deleting U.S. Location rows…");

  const usLocations = await prisma.location.findMany({
    where: { country: "United States" },
    select: { id: true },
  });

  const skippedLocations = usLocations.filter((l) =>
    usedLocationIds.has(l.id),
  );

  const locationResult = await prisma.location.deleteMany({
    where: {
      country: "United States",
      id: { notIn: [...usedLocationIds] },
    },
  });

  console.log(
    `  Locations — ${locationResult.count} deleted, ${skippedLocations.length} skipped`,
  );

  if (skippedLocations.length > 0) {
    console.warn(
      "  ⚠ The following U.S. location IDs are still referenced by businesses and were NOT deleted:",
    );
    skippedLocations.forEach((l) => console.warn(`    • ${l.id}`));
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  console.log("\nDeleting U.S. BusinessCategory rows…");

  const resultA = await deleteCategories(
    prisma,
    GROUP_A_SLUGS,
    usedCategoryIds,
    "Group A (regional specialties)",
  );

  const resultB = await deleteCategories(
    prisma,
    GROUP_B_SLUGS,
    usedCategoryIds,
    "Group B (regional parents) ",
  );

  const resultC = await deleteCategories(
    prisma,
    GROUP_C_SLUGS,
    usedCategoryIds,
    "Group C (national categories)",
  );

  const allSkippedCategories = [
    ...resultA.skipped,
    ...resultB.skipped,
    ...resultC.skipped,
  ];

  if (allSkippedCategories.length > 0) {
    console.warn(
      "\n  ⚠ The following U.S. category slugs are still referenced by businesses and were NOT deleted:",
    );
    allSkippedCategories.forEach((c) =>
      console.warn(`    • ${c.slug}  (id: ${c.id})`),
    );
  }

  const totalCatDeleted =
    resultA.deleted + resultB.deleted + resultC.deleted;
  const totalCatSkipped =
    resultA.skipped.length +
    resultB.skipped.length +
    resultC.skipped.length;

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log("\n========================================");
  console.log(" U.S. Seed Cleanup Complete");
  console.log("========================================");
  console.log(
    `  Locations  — ${locationResult.count} deleted, ${skippedLocations.length} skipped (in use)`,
  );
  console.log(
    `  Categories — ${totalCatDeleted} deleted, ${totalCatSkipped} skipped (in use)`,
  );
  console.log('\nRun "npm run db:seed" to populate Sierra Leone data.');
  console.log("========================================\n");
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
