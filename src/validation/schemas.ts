import { z } from "zod";

export const userRegistrationSchema = z
  .object({
    email: z.string().email().max(100),
    username: z.string().max(100),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type userRegistrationPayload = z.infer<typeof userRegistrationSchema>;

export const userSignInSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100),
});

export const createClientSchema = z.object({
  email: z.string().email().max(100),
  name: z.string().max(100),
});

export type createClientPayload = z.infer<typeof createClientSchema>;
