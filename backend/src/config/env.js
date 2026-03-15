import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "fallback-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  allowPastLeaveApply: process.env.ALLOW_PAST_LEAVE_APPLY === "true",
};
