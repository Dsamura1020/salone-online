import { z } from "zod";

export const submitVerificationSchema = z.object({
  businessId: z.uuid(),
});

export const verificationDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  comments: z.string().max(2000).optional(),
});

export const verificationListQuerySchema = z.object({
  status: z
    .enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type VerificationDecisionInput = z.infer<
  typeof verificationDecisionSchema
>;
