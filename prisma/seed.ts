import { createSeedPrisma } from "./seed/lib/prisma";
import { seedCategories } from "./seed/categories";
import { seedLocations } from "./seed/locations";
import { seedRoles } from "./seed/roles";
import { seedUsers } from "./seed/users";

const prisma = createSeedPrisma();

async function main() {
  console.log("Seeding database (safe re-run — existing rows are not modified)…\n");

  await seedRoles(prisma);
  await seedCategories(prisma);
  await seedLocations(prisma);
  await seedUsers(prisma);

  console.log("\nSeed complete.");
  console.log("\nDefault accounts (override via .env):");
  console.log("  SUPER_ADMIN — superadmin@example.com / SuperAdmin123!@#");
  console.log("  ADMIN       — admin@example.com / Admin123!@#");
  console.log("  OWNER       — owner@example.com / Owner123!@#");
  console.log("  USER        — user@example.com / User123!@#");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
