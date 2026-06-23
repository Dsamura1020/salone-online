import type { VerificationDecisionType, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";

export const verificationRepository = {
  findOwnedBusiness(businessId: string, ownerId: string) {
    return prisma.business.findFirst({
      where: { id: businessId, ownerId },
    });
  },

  findPendingRequest(businessId: string) {
    return prisma.verificationRequest.findFirst({
      where: {
        businessId,
        status: { in: ["PENDING", "UNDER_REVIEW"] },
      },
    });
  },

  createRequest(businessId: string, submittedById: string) {
    return prisma.$transaction([
      prisma.verificationRequest.create({
        data: {
          businessId,
          submittedById,
          status: "PENDING",
        },
        include: {
          business: { select: { businessName: true, slug: true } },
          submittedBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.business.update({
        where: { id: businessId },
        data: { verificationStatus: "PENDING" },
      }),
    ]);
  },

  findById(verificationRequestId: string) {
    return prisma.verificationRequest.findUnique({
      where: { id: verificationRequestId },
      include: { business: true },
    });
  },

  recordDecision(params: {
    verificationRequestId: string;
    verifierId: string;
    decision: VerificationDecisionType;
    comments?: string;
    businessId: string;
    businessStatus: VerificationStatus;
  }) {
    const { verificationRequestId, verifierId, decision, comments, businessId, businessStatus } =
      params;

    return prisma.$transaction(async (tx) => {
      const verificationDecision = await tx.verificationDecision.create({
        data: {
          verificationRequestId,
          verifierId,
          decision,
          comments,
        },
      });

      await tx.verificationRequest.update({
        where: { id: verificationRequestId },
        data: {
          status: businessStatus,
          reviewedAt: new Date(),
        },
      });

      await tx.business.update({
        where: { id: businessId },
        data: {
          verificationStatus: businessStatus,
          isVerified: decision === "APPROVED",
          isPublished: decision === "APPROVED",
        },
      });

      await tx.auditLog.create({
        data: {
          userId: verifierId,
          entityType: "VerificationRequest",
          entityId: verificationRequestId,
          action: `VERIFICATION_${decision}`,
          newValues: { decision, comments },
        },
      });

      return verificationDecision;
    });
  },

  list(options: {
    status?: VerificationStatus;
    page: number;
    limit: number;
  }) {
    const where = options.status ? { status: options.status } : {};

    return prisma.$transaction([
      prisma.verificationRequest.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              verificationStatus: true,
              category: {
                select: {
                  name: true,
                },
              },
              documents: {
                select: {
                  fileName: true,
                },
                orderBy: {
                  uploadedAt: "desc",
                },
                take: 1,
              },
            },
          },
          submittedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          decisions: {
            orderBy: { decidedAt: "desc" },
            take: 1,
            include: {
              verifier: {
                select: { id: true, email: true, firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.verificationRequest.count({ where }),
    ]);
  },
};
