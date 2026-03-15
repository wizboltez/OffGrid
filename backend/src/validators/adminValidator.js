import { z } from "zod";

const emptyObj = z.object({});

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]),
    departmentId: z.number().int().positive().nullable().optional(),
    managerId: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional().default(true),
  }),
  params: emptyObj,
  query: emptyObj,
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).optional(),
    departmentId: z.number().int().positive().nullable().optional(),
    managerId: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObj,
});

export const setUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObj,
});

export const idParamSchema = z.object({
  body: emptyObj,
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObj,
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).nullable().optional(),
  }),
  params: emptyObj,
  query: emptyObj,
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(255).nullable().optional(),
  }),
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObj,
});

export const createLeaveTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).nullable().optional(),
    defaultAllowance: z.coerce.number().min(0),
    requiresDocument: z.boolean(),
    carryForwardAllowed: z.boolean(),
    isActive: z.boolean().optional().default(true),
  }),
  params: emptyObj,
  query: emptyObj,
});

export const updateLeaveTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(255).nullable().optional(),
    defaultAllowance: z.coerce.number().min(0).optional(),
    requiresDocument: z.boolean().optional(),
    carryForwardAllowed: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObj,
});
