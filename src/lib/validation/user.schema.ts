import { z } from "zod";
import { passwordSchema } from "@/lib/validation/auth.schema";

const optionalProfileText = z
  .string()
  .max(100)
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

export const updateUserProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, and underscores"),
  phone: optionalProfileText,
  timezone: optionalProfileText,
  locale: optionalProfileText,
});

export const confirmPasswordChangeSchema = z
  .object({
    otp: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit verification code"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ConfirmPasswordChangeInput = z.infer<
  typeof confirmPasswordChangeSchema
>;
