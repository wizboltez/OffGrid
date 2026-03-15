import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validated.body);
  res.status(StatusCodes.CREATED).json(apiResponse({ message: "User registered", data: result }));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Login successful", data: result }));
});
