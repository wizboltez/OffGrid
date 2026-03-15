import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as notificationService from "../services/notificationService.js";

export const mine = asyncHandler(async (req, res) => {
  const result = await notificationService.listMyNotifications(req.user.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Notifications fetched", data: result }));
});
