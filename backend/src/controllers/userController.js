import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as userService from "../services/userService.js";

export const me = asyncHandler(async (req, res) => {
  const result = await userService.getMe(req.user.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Profile fetched", data: result }));
});

export const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(StatusCodes.OK).json(
    apiResponse({
      message: "Users fetched",
      data: result.items,
      meta: result.meta,
    })
  );
});

export const create = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.validated.body);
  res.status(StatusCodes.CREATED).json(apiResponse({ message: "User created", data: result }));
});

export const update = asyncHandler(async (req, res) => {
  const result = await userService.updateUser(req.validated.params.id, req.validated.body);
  res.status(StatusCodes.OK).json(apiResponse({ message: "User updated", data: result }));
});

export const setStatus = asyncHandler(async (req, res) => {
  const result = await userService.setUserStatus(req.validated.params.id, req.validated.body.isActive);
  res.status(StatusCodes.OK).json(apiResponse({ message: "User status updated", data: result }));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.validated.params.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "User deactivated", data: result }));
});
