import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const createBusinessSchema = z.object({
  categoryId: z.uuid(),
  locationId: z.uuid(),
  businessName: z.string().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: optionalTrimmedString.pipe(z.string().max(5000).optional()),
  email: optionalTrimmedString.pipe(z.email().optional()),
  phone: optionalTrimmedString.pipe(z.string().max(30).optional()),
  website: optionalTrimmedString.pipe(z.url().optional()),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
  employeeCount: z.number().int().min(1).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
