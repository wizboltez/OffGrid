import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as departmentService from "../services/departmentService.js";

export const list = asyncHandler(async (_req, res) => {
  const result = await departmentService.listDepartments();
  res.status(StatusCodes.OK).json(apiResponse({ message: "Departments fetched", data: result }));
});

export const create = asyncHandler(async (req, res) => {
  const result = await departmentService.createDepartment(req.validated.body);
  res.status(StatusCodes.CREATED).json(apiResponse({ message: "Department created", data: result }));
});

export const update = asyncHandler(async (req, res) => {
  const result = await departmentService.updateDepartment(req.validated.params.id, req.validated.body);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Department updated", data: result }));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await departmentService.deleteDepartment(req.validated.params.id);
  res.status(StatusCodes.OK).json(apiResponse({ message: "Department deleted", data: result }));
});
