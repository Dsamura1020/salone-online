/**
 * Dev utility: set a user's password without touching other data.
 * Usage: npx tsx scripts/set-user-password.ts <email> <password>
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { normalizeEmail } from "@/lib/security/sanitize";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const emailArg = process.argv[2];
  const password = process.argv[3];

  if (!emailArg || !password) {
    console.error("Usage: npx tsx scripts/set-user-password.ts <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const email = normalizeEmail(emailArg);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      isActive: true,
      isSuspended: false,
      emailVerified: user.emailVerified ?? new Date(),
    },
  });

  console.log(`Password updated for ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
