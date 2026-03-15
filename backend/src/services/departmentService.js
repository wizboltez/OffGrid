import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export function listDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export function createDepartment(payload) {
  return prisma.department.create({
    data: {
      name: payload.name,
      description: payload.description,
    },
  });
}

export async function updateDepartment(id, payload) {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }

  return prisma.department.update({
    where: { id },
    data: {
      name: payload.name,
      description: payload.description,
    },
  });
}

export async function deleteDepartment(id) {
  const existing = await prisma.department.findUnique({
    where: { id },
    include: { users: true },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }

  if (existing.users.length > 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot delete department with assigned users");
  }

  return prisma.department.delete({ where: { id } });
}
