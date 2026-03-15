import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function register(payload) {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
  }

  const role = await prisma.role.findUnique({ where: { name: payload.role } });
  if (!role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      roleId: role.id,
      departmentId: payload.departmentId,
      managerId: payload.managerId,
    },
    include: { role: true },
  });

  return buildAuthPayload(user);
}

export async function login(payload) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials or inactive account");
  }

  const matched = await bcrypt.compare(payload.password, user.passwordHash);
  if (!matched) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  return buildAuthPayload(user);
}

function buildAuthPayload(user) {
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role.name,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
      managerId: user.managerId,
    },
  };
}
