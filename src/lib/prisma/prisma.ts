import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/** Bump when the Prisma schema changes so dev hot-reload picks up a fresh client. */
const PRISMA_CLIENT_KEY = "business-view-pool-v6";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientKey?: string;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = new PrismaPg({
    connectionString: normalizePostgresSslMode(connectionString),
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 300_000,
    max: 5,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function normalizePostgresSslMode(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return connectionString;
  }

  return connectionString;
}

function getPrismaClient() {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaClientKey === PRISMA_CLIENT_KEY
  ) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaClientKey = PRISMA_CLIENT_KEY;
  }

  return client;
}

export const prisma = getPrismaClient();
