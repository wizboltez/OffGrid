import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/prisma.js";

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
