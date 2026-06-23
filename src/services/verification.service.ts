import type { VerificationDecisionType, VerificationStatus } from "@prisma/client";
import { verificationRepository } from "@/repositories/verification.repository";

export async function submitVerificationRequest(
  businessId: string,
  submittedById: string,
) {
  const business = await verificationRepository.findOwnedBusiness(
    businessId,
    submittedById,
  );

  if (!business) {
    throw new Error("Business not found or access denied");
  }

  const pending = await verificationRepository.findPendingRequest(businessId);

  if (pending) {
    throw new Error("A verification request is already in progress");
  }

  const [request] = await verificationRepository.createRequest(
    businessId,
    submittedById,
  );

  return request;
}

export async function recordVerificationDecision(
  verificationRequestId: string,
  verifierId: string,
  decision: VerificationDecisionType,
  comments?: string,
) {
  const request = await verificationRepository.findById(verificationRequestId);

  if (!request) {
    throw new Error("Verification request not found");
  }

  if (request.status === "APPROVED" || request.status === "REJECTED") {
    throw new Error("Verification request is already closed");
  }

  const businessStatus: VerificationStatus =
    decision === "APPROVED" ? "APPROVED" : "REJECTED";

  return verificationRepository.recordDecision({
    verificationRequestId,
    verifierId,
    decision,
    comments,
    businessId: request.businessId,
    businessStatus,
  });
}

export async function listVerificationRequests(options: {
  status?: VerificationStatus;
  page: number;
  limit: number;
}) {
  const [items, total] = await verificationRepository.list(options);

  return { items, total, page: options.page, limit: options.limit };
}
