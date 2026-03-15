import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboardService.js";

export const employee = asyncHandler(async (req, res) => {
  const result = await dashboardService.getEmployeeDashboard(req.user.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Employee dashboard fetched", data: result }));
});

export const manager = asyncHandler(async (req, res) => {
  const result = await dashboardService.getManagerDashboard(req.user.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Manager dashboard fetched", data: result }));
});

export const admin = asyncHandler(async (_req, res) => {
  const result = await dashboardService.getAdminDashboard();
  res.status(StatusCodes.OK).json(apiResponse({ message: "Admin dashboard fetched", data: result }));
});
