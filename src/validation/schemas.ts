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

export const createProjectSchema = z.object({
  name: z.string().max(100),
  clientId: z.number().nonnegative().min(1),
});

export const updateClientSchema = createClientSchema.extend({
  active: z.boolean(),
});

export const updateProjectSchema = createProjectSchema.extend({
  active: z.boolean(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a anumber"),
});

export type createClientPayload = z.infer<typeof createClientSchema>;
export type updateClientPayload = z.infer<typeof updateClientSchema>;
export type createProjectPayload = z.infer<typeof createProjectSchema>;
export type updateProjectPayload = z.infer<typeof updateProjectSchema>;
