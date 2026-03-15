import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Missing token");
    }

    const payload = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User is inactive or not found");
    }

    req.user = {
      id: user.id,
      role: user.role.name,
      managerId: user.managerId,
      departmentId: user.departmentId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
