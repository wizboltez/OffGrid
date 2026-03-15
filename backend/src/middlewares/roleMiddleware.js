import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";

export const requireRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Insufficient role permission"));
  }
  next();
};
