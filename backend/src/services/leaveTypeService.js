import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

function normalizeLeaveTypeName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function ensureUniqueLeaveTypeName(name, excludeId = null) {
  const normalized = normalizeLeaveTypeName(name);
  if (!normalized) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Leave type name is required");
  }

  const existing = await prisma.leaveType.findMany({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: {
      id: true,
      name: true,
    },
  });

  const duplicate = existing.find((item) => normalizeLeaveTypeName(item.name) === normalized);
  if (duplicate) {
    throw new ApiError(StatusCodes.CONFLICT, "Leave type already exists");
  }
}

export async function listLeaveTypes() {
  const rows = await prisma.leaveType.findMany({
    orderBy: [{ isActive: "desc" }, { id: "desc" }],
  });

  const deduped = new Map();
  for (const row of rows) {
    const key = normalizeLeaveTypeName(row.name);
    if (!key) continue;
    if (!deduped.has(key)) {
      deduped.set(key, {
        ...row,
        name: row.name.trim().replace(/\s+/g, " "),
      });
    }
  }

  return Array.from(deduped.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function createLeaveType(payload) {
  await ensureUniqueLeaveTypeName(payload.name);

  return prisma.leaveType.create({
    data: {
      ...payload,
      name: payload.name.trim().replace(/\s+/g, " "),
    },
  });
}

export async function updateLeaveType(id, payload) {
  const existing = await prisma.leaveType.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave type not found");
  }

  if (typeof payload.name === "string") {
    await ensureUniqueLeaveTypeName(payload.name, id);
  }

  return prisma.leaveType.update({
    where: { id },
    data: {
      ...payload,
      ...(typeof payload.name === "string"
        ? { name: payload.name.trim().replace(/\s+/g, " ") }
        : {}),
    },
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
