import { z } from "zod";
import { normalizeEmail } from "@/lib/security/sanitize";

const normalizedEmailSchema = z.preprocess(
  (value) => (typeof value === "string" ? normalizeEmail(value) : value),
  z.email(),
);

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(8),
});

export const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

const phoneSchema = z.string().min(7).max(30).optional();

export const userRegisterSchema = z
  .object({
    accountType: z.literal("user").default("user"),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional(),
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
    phone: phoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const businessRegisterSchema = z
  .object({
    accountType: z.literal("business"),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    businessName: z.string().min(2).max(200),
    categoryName: z.string().min(2).max(100),
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
    phone: phoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSchema = z.discriminatedUnion("accountType", [
  userRegisterSchema,
  businessRegisterSchema,
]);

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit verification code"),
});

export const resendOtpSchema = z.object({
  email: z.email(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
