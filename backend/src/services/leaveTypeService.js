import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export function listLeaveTypes() {
  return prisma.leaveType.findMany({ orderBy: { name: "asc" } });
}

export function createLeaveType(payload) {
  return prisma.leaveType.create({
    data: payload,
  });
}

export async function updateLeaveType(id, payload) {
  const existing = await prisma.leaveType.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave type not found");
  }

  return prisma.leaveType.update({
    where: { id },
    data: payload,
  });
}

export async function deleteLeaveType(id) {
  const existing = await prisma.leaveType.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave type not found");
  }

  return prisma.leaveType.update({
    where: { id },
    data: { isActive: false },
  });
}
