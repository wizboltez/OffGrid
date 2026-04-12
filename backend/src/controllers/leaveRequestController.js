import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import * as leaveRequestService from "../services/leaveRequestService.js";

export const create = asyncHandler(async (req, res) => {
  const result = await leaveRequestService.createLeaveRequest(req.user, req.validated.body, req.file);
  res.status(StatusCodes.CREATED).json(apiResponse({ message: "Leave request submitted", data: result }));
});

export const update = asyncHandler(async (req, res) => {
  const result = await leaveRequestService.updateLeaveRequest(req.user, req.validated.params.id, req.validated.body, req.file);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave request updated", data: result }));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await leaveRequestService.deleteLeaveRequest(req.user, req.validated.params.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave request deleted", data: result }));
});

export const list = asyncHandler(async (req, res) => {
  const result = await leaveRequestService.listLeaveRequests(req.user, req.query);
  res.status(StatusCodes.OK).json(
    apiResponse({
      message: "Leave requests fetched",
      data: result.items,
      meta: result.meta,
    })
  );
});

export const approve = asyncHandler(async (req, res) => {
  const result = await leaveRequestService.decideLeaveRequest(
    req.user,
    req.validated.params.id,
    "approve",
    req.validated.body.remark || "Approved"
  );
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave request approved", data: result }));
});

export const reject = asyncHandler(async (req, res) => {
  if (!req.validated.body.remark) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rejection reason is required");
  }
  const result = await leaveRequestService.decideLeaveRequest(
    req.user,
    req.validated.params.id,
    "reject",
    req.validated.body.remark
  );
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave request rejected", data: result }));
});

export const cancel = asyncHandler(async (req, res) => {
  const result = await leaveRequestService.cancelLeaveRequest(req.user, req.validated.params.id, req.validated.body.remark);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Leave request cancelled", data: result }));
});
