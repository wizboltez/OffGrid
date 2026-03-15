import { z } from "zod";

const leaveIdParam = z.object({ id: z.coerce.number().int().positive() });

export const createLeaveRequestSchema = z.object({
  body: z.object({
    leaveTypeId: z.number().int().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string().min(5).max(500),
    isHalfDay: z.boolean().default(false),
    emergencyFlag: z.boolean().default(false),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const leaveActionSchema = z.object({
  body: z.object({
    remark: z.string().max(500).optional(),
  }),
  params: leaveIdParam,
  query: z.object({}),
});
