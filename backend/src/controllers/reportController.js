import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as reportService from "../services/reportService.js";

export const monthly = asyncHandler(async (req, res) => {
  const month = Number(req.query.month || new Date().getMonth() + 1);
  const year = Number(req.query.year || new Date().getFullYear());
  const result = await reportService.getMonthlyLeaveReport(month, year);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Monthly report fetched", data: result }));
});
