import type { Prisma, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";

export const businessRepository = {
  findOwnerById(ownerId: string) {
    return prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, isActive: true, isSuspended: true },
    });
  },

  create(data: Prisma.BusinessCreateInput) {
    return prisma.business.create({
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        location: {
          select: { id: true, city: true, stateProvince: true, country: true },
        },
      },
    });
  },

  findOwnedById(businessId: string, ownerId: string) {
    return prisma.business.findFirst({
      where: { id: businessId, ownerId },
      select: {
        id: true,
        slug: true,
        verificationStatus: true,
        isVerified: true,
      },
    });
  },

  findOwnedWithDetails(businessId: string, ownerId: string) {
    return prisma.business.findFirst({
      where: { id: businessId, ownerId },
      include: {
        category: true,
        location: true,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        verificationRequests: {
          orderBy: { submittedAt: "desc" },
          include: {
            decisions: {
              orderBy: { decidedAt: "desc" },
              include: {
                verifier: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  update(businessId: string, data: Prisma.BusinessUpdateInput) {
    return prisma.business.update({
      where: { id: businessId },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        location: {
          select: { id: true, city: true, stateProvince: true, country: true },
        },
      },
    });
  },

  listByOwner(ownerId: string) {
    return prisma.business.findMany({
      where: { ownerId },
      select: {
        id: true,
        businessName: true,
        slug: true,
        verificationStatus: true,
        isPublished: true,
        isVerified: true,
        createdAt: true,
        verificationRequests: {
          select: { id: true },
          take: 1,
          orderBy: { submittedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};

export type OwnerVerificationDisplayStatus =
  | "Incomplete"
  | "Pending review"
  | "Under review"
  | "Approved"
  | "Rejected";

export type OwnerBusinessBadgeStatus =
  | "verified"
  | "pending_review"
  | "incomplete"
  | "rejected";

export function getDisplayVerificationStatus(
  verificationStatus: VerificationStatus,
  hasVerificationRequest: boolean,
): OwnerVerificationDisplayStatus {
  if (verificationStatus === "APPROVED") {
    return "Approved";
  }
  if (verificationStatus === "REJECTED") {
    return "Rejected";
  }
  if (!hasVerificationRequest) {
    return "Incomplete";
  }
  if (verificationStatus === "UNDER_REVIEW") {
    return "Under review";
  }
  return "Pending review";
}

export function mapDisplayStatusToBadgeStatus(
  displayStatus: OwnerVerificationDisplayStatus,
): OwnerBusinessBadgeStatus {
  switch (displayStatus) {
    case "Approved":
      return "verified";
    case "Rejected":
      return "rejected";
    case "Incomplete":
      return "incomplete";
    default:
      return "pending_review";
  }
}
