import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).default("EMPLOYEE"),
    departmentId: z.number().int().positive().optional(),
    managerId: z.number().int().positive().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  params: z.object({}),
  query: z.object({}),
});
