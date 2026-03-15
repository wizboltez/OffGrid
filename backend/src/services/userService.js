import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { getPaginationParams } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";

export async function getMe(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      department: true,
      manager: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export async function listUsers(query) {
  const { page, pageSize, skip, take } = getPaginationParams(query);
  const where = {
    ...(query.role ? { role: { name: query.role } } : {}),
    ...(query.departmentId ? { departmentId: Number(query.departmentId) } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      include: { role: true, department: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function createUser(payload) {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
  }

  const role = await prisma.role.findUnique({ where: { name: payload.role } });
  if (!role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role");
  }

  if (payload.managerId) {
    const manager = await prisma.user.findUnique({
      where: { id: payload.managerId },
      include: { role: true },
    });
    if (!manager || manager.role.name !== "MANAGER") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "managerId must reference a manager");
    }
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  return prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      roleId: role.id,
      departmentId: payload.departmentId || null,
      managerId: payload.managerId || null,
      isActive: payload.isActive ?? true,
    },
    include: { role: true, department: true },
  });
}

export async function updateUser(id, payload) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (payload.email && payload.email !== existing.email) {
    const emailUsed = await prisma.user.findUnique({ where: { email: payload.email } });
    if (emailUsed) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
    }
  }

  let roleId;
  if (payload.role) {
    const role = await prisma.role.findUnique({ where: { name: payload.role } });
    if (!role) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role");
    roleId = role.id;
  }

  if (payload.managerId) {
    const manager = await prisma.user.findUnique({
      where: { id: payload.managerId },
      include: { role: true },
    });
    if (!manager || manager.role.name !== "MANAGER") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "managerId must reference a manager");
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      fullName: payload.fullName,
      email: payload.email,
      roleId,
      departmentId: payload.departmentId,
      managerId: payload.managerId,
      isActive: payload.isActive,
    },
    include: { role: true, department: true },
  });
}

export async function setUserStatus(id, isActive) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { isActive },
    include: { role: true, department: true },
  });
}

export async function deleteUser(id) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}
