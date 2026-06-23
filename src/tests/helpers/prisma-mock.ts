import { vi } from "vitest";

/**
 * Minimal Prisma mock for workflow / service unit tests.
 * Extend per test with mockResolvedValue / mockImplementation.
 */
export function createPrismaMock() {
  const mockTx = {
    verificationDecision: { create: vi.fn() },
    verificationRequest: { update: vi.fn() },
    business: { update: vi.fn() },
    auditLog: { create: vi.fn() },
  };

  const prisma = {
    business: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    verificationRequest: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    verificationDecision: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    review: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === "function") {
        return arg(mockTx);
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      return arg;
    }),
  };

  return { prisma, mockTx };
}
