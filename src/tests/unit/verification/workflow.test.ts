import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => {
  const mockTx = {
    verificationDecision: { create: vi.fn() },
    verificationRequest: { update: vi.fn() },
    business: { update: vi.fn() },
    auditLog: { create: vi.fn() },
  };

  const prismaMock = {
    business: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationRequest: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    auditLog: { create: vi.fn() },
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

  return { prisma: prismaMock, mockTx };
});

vi.mock("@/lib/prisma/prisma", () => ({ prisma }));

import {
  recordVerificationDecision,
  submitVerificationRequest,
} from "@/lib/verification/workflow";

const businessId = "550e8400-e29b-41d4-a716-446655440001";
const ownerId = "550e8400-e29b-41d4-a716-446655440002";
const requestId = "550e8400-e29b-41d4-a716-446655440003";
const verifierId = "550e8400-e29b-41d4-a716-446655440004";

describe("submitVerificationRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a request when business exists and none is pending", async () => {
    const created = {
      id: requestId,
      businessId,
      status: "PENDING",
    };

    prisma.business.findFirst.mockResolvedValue({ id: businessId });
    prisma.verificationRequest.findFirst.mockResolvedValue(null);
    prisma.verificationRequest.create.mockResolvedValue(created);
    prisma.business.update.mockResolvedValue({});

    const result = await submitVerificationRequest(businessId, ownerId);

    expect(result).toEqual(created);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("throws when business is not owned by submitter", async () => {
    prisma.business.findFirst.mockResolvedValue(null);

    await expect(
      submitVerificationRequest(businessId, ownerId),
    ).rejects.toThrow("Business not found or access denied");
  });

  it("throws when a verification is already in progress", async () => {
    prisma.business.findFirst.mockResolvedValue({ id: businessId });
    prisma.verificationRequest.findFirst.mockResolvedValue({
      id: requestId,
      status: "PENDING",
    });

    await expect(
      submitVerificationRequest(businessId, ownerId),
    ).rejects.toThrow("A verification request is already in progress");
  });
});

describe("recordVerificationDecision", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when request does not exist", async () => {
    prisma.verificationRequest.findUnique.mockResolvedValue(null);

    await expect(
      recordVerificationDecision(requestId, verifierId, "APPROVED"),
    ).rejects.toThrow("Verification request not found");
  });

  it("throws when request is already closed", async () => {
    prisma.verificationRequest.findUnique.mockResolvedValue({
      id: requestId,
      status: "APPROVED",
      businessId,
      business: { id: businessId },
    });

    await expect(
      recordVerificationDecision(requestId, verifierId, "REJECTED"),
    ).rejects.toThrow("Verification request is already closed");
  });
});
