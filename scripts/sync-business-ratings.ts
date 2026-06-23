/**
 * Backfill Business.averageRating from Rating rows.
 * Run: npx tsx scripts/sync-business-ratings.ts
 */
import { prisma } from "../src/lib/prisma/prisma";
import { recalculateBusinessRating } from "../src/repositories/rating.repository";

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      ratings: { some: {} },
    },
    select: { id: true, businessName: true },
  });

  for (const business of businesses) {
    const result = await recalculateBusinessRating(business.id);
    console.log(
      `${business.businessName}: average=${result.averageRating}, ratings=${result.ratingCount}`,
    );
  }

  console.log(`Synced ${businesses.length} business(es).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
