import type { Prisma } from "@prisma/client";
import type {
  CreateBusinessInput,
  UpdateBusinessInput,
} from "@/lib/validation/business";
import { generateUniqueBusinessSlug } from "@/lib/business/slug";
import {
  businessRepository,
  getDisplayVerificationStatus,
} from "@/repositories/business.repository";
import { submitVerificationRequest } from "@/services/verification.service";

export async function createBusiness(ownerId: string, input: CreateBusinessInput) {
  const owner = await businessRepository.findOwnerById(ownerId);

  if (!owner || !owner.isActive || owner.isSuspended) {
    throw new Error("Your session is out of date. Please sign out and sign in again.");
  }

  const slug = await generateUniqueBusinessSlug(input.slug ?? input.businessName);

  return businessRepository.create({
    owner: { connect: { id: ownerId } },
    category: { connect: { id: input.categoryId } },
    location: { connect: { id: input.locationId } },
    businessName: input.businessName,
    slug,
    description: input.description,
    email: input.email,
    phone: input.phone,
    website: input.website,
    foundedYear: input.foundedYear,
    employeeCount: input.employeeCount,
    isPublished: false,
    verificationStatus: "PENDING",
  });
}

export async function updateBusinessForOwner(
  businessId: string,
  ownerId: string,
  input: UpdateBusinessInput,
) {
  const existing = await businessRepository.findOwnedById(businessId, ownerId);

  if (!existing) {
    throw new Error("Business not found or access denied");
  }

  const data: Prisma.BusinessUpdateInput = {
    category: input.categoryId
      ? { connect: { id: input.categoryId } }
      : undefined,
    location: input.locationId
      ? { connect: { id: input.locationId } }
      : undefined,
    businessName: input.businessName,
    description: input.description,
    email: input.email,
    phone: input.phone,
    website: input.website,
    foundedYear: input.foundedYear,
    employeeCount: input.employeeCount,
  };

  if (input.slug) {
    data.slug = await generateUniqueBusinessSlug(input.slug, existing.id);
  }

  return businessRepository.update(existing.id, data);
}

export async function listOwnerBusinesses(ownerId: string) {
  const businesses = await businessRepository.listByOwner(ownerId);

  return businesses.map((business) => ({
    ...business,
    displayStatus: getDisplayVerificationStatus(
      business.verificationStatus,
      business.verificationRequests.length > 0,
    ),
  }));
}

export {
  getDisplayVerificationStatus,
  mapDisplayStatusToBadgeStatus,
} from "@/repositories/business.repository";
export type {
  OwnerBusinessBadgeStatus,
  OwnerVerificationDisplayStatus,
} from "@/repositories/business.repository";

export async function getBusinessForOwner(businessId: string, ownerId: string) {
  return businessRepository.findOwnedWithDetails(businessId, ownerId);
}

export async function submitBusinessForVerification(
  businessId: string,
  ownerId: string,
) {
  return submitVerificationRequest(businessId, ownerId);
}
