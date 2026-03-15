import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as leaveBalanceService from "../services/leaveBalanceService.js";

export const myBalances = asyncHandler(async (req, res) => {
  const result = await leaveBalanceService.getMyLeaveBalances(req.user.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave balances fetched", data: result }));
});

export const adjust = asyncHandler(async (req, res) => {
  const result = await leaveBalanceService.adjustBalance(req.body);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave balance adjusted", data: result }));
});
