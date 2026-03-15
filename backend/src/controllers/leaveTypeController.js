import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as leaveTypeService from "../services/leaveTypeService.js";

export const list = asyncHandler(async (_req, res) => {
  const result = await leaveTypeService.listLeaveTypes();
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave types fetched", data: result }));
});

export const create = asyncHandler(async (req, res) => {
  const result = await leaveTypeService.createLeaveType(req.validated.body);
  res.status(StatusCodes.CREATED).json(apiResponse({ message: "Leave type created", data: result }));
});

export const update = asyncHandler(async (req, res) => {
  const result = await leaveTypeService.updateLeaveType(req.validated.params.id, req.validated.body);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave type updated", data: result }));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await leaveTypeService.deleteLeaveType(req.validated.params.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave type deactivated", data: result }));
});
