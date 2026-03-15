import { ApprovalActionType, LeaveStatus, RoleName } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateLeaveDays, isPastDate, toDateOnly } from "../utils/dateUtils.js";
import { getPaginationParams } from "../utils/pagination.js";
import { createNotification } from "./notificationService.js";

async function ensureBalance(employeeId, leaveTypeId, year) {
  const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
  if (!leaveType || !leaveType.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Leave type not available");
  }

  const balance = await prisma.leaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId,
        leaveTypeId,
        year,
      },
    },
    update: {},
    create: {
      employeeId,
      leaveTypeId,
      year,
      allocated: leaveType.defaultAllowance,
      used: 0,
      remaining: leaveType.defaultAllowance,
      carriedForward: 0,
    },
    include: { leaveType: true },
  });

  return balance;
}

async function hasOverlappingLeave(employeeId, startDate, endDate) {
  const count = await prisma.leaveRequest.count({
    where: {
      employeeId,
      status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      AND: [
        { startDate: { lte: endDate } },
        { endDate: { gte: startDate } },
      ],
    },
  });
  return count > 0;
}

export async function createLeaveRequest(user, payload, file) {
  const startDate = toDateOnly(payload.startDate);
  const endDate = toDateOnly(payload.endDate);

  if (startDate > endDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Start date cannot be after end date");
  }

  if (!env.allowPastLeaveApply && isPastDate(startDate) && user.role !== RoleName.ADMIN) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot apply leave for past dates");
  }

  const totalDays = calculateLeaveDays(startDate, endDate, payload.isHalfDay);
  if (totalDays <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid leave date range");
  }

  const overlap = await hasOverlappingLeave(user.id, startDate, endDate);
  if (overlap) {
    throw new ApiError(StatusCodes.CONFLICT, "Overlapping leave request exists");
  }

  const year = startDate.getFullYear();
  const balance = await ensureBalance(user.id, payload.leaveTypeId, year);

  if (balance.leaveType.requiresDocument && !file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Supporting document is required for this leave type");
  }

  if (Number(balance.remaining) < Number(totalDays)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient leave balance");
  }

  const request = await prisma.leaveRequest.create({
    data: {
      employeeId: user.id,
      leaveTypeId: payload.leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason: payload.reason,
      isHalfDay: payload.isHalfDay,
      emergencyFlag: payload.emergencyFlag,
      status: LeaveStatus.PENDING,
      attachments: file
        ? {
            create: {
              fileName: file.originalname,
              filePath: file.path,
              mimeType: file.mimetype,
            },
          }
        : undefined,
      approvalLogs: {
        create: {
          actionBy: user.id,
          actionType: ApprovalActionType.APPLIED,
          remark: "Leave applied",
        },
      },
    },
    include: { employee: true, leaveType: true, attachments: true },
  });

  if (request.employee.managerId) {
    await createNotification(
      request.employee.managerId,
      "New leave request",
      `${request.employee.fullName} applied for ${request.leaveType.name}`
    );
  }

  return request;
}

export async function listLeaveRequests(user, query) {
  const { page, pageSize, skip, take } = getPaginationParams(query);
  const where = {};

  if (user.role === RoleName.EMPLOYEE) {
    where.employeeId = user.id;
  }

  if (user.role === RoleName.MANAGER) {
    where.employee = { managerId: user.id };
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.leaveTypeId) {
    where.leaveTypeId = Number(query.leaveTypeId);
  }

  if (query.employeeId && user.role === RoleName.ADMIN) {
    where.employeeId = Number(query.employeeId);
  }

  const orderBy = { appliedAt: query.sort === "oldest" ? "asc" : "desc" };

  const [items, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        employee: { select: { id: true, fullName: true, email: true } },
        leaveType: true,
        attachments: true,
      },
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function enforceActorPermissions(actor, leaveRequest) {
  if (actor.role === RoleName.ADMIN) return;

  if (actor.role === RoleName.MANAGER && leaveRequest.employee.managerId === actor.id) {
    return;
  }

  throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed to process this leave request");
}

export async function decideLeaveRequest(actor, leaveRequestId, action, remark) {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: {
      employee: true,
      leaveType: true,
    },
  });

  if (!leaveRequest) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave request not found");
  }

  await enforceActorPermissions(actor, leaveRequest);

  if (leaveRequest.status !== LeaveStatus.PENDING) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Request already processed");
  }

  const year = new Date(leaveRequest.startDate).getFullYear();
  const balance = await ensureBalance(leaveRequest.employeeId, leaveRequest.leaveTypeId, year);
  const days = Number(leaveRequest.totalDays);

  const nextStatus = action === "approve" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

  if (nextStatus === LeaveStatus.APPROVED && Number(balance.remaining) < days) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient balance at approval time");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: nextStatus,
        managerRemark: remark,
        approvedBy: actor.id,
        approvedAt: new Date(),
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    if (nextStatus === LeaveStatus.APPROVED) {
      const newUsed = Number(balance.used) + days;
      const newRemaining = Number(balance.allocated) - newUsed + Number(balance.carriedForward);
      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: newUsed,
          remaining: newRemaining,
        },
      });
    }

    await tx.approvalLog.create({
      data: {
        leaveRequestId,
        actionBy: actor.id,
        actionType: nextStatus === LeaveStatus.APPROVED ? ApprovalActionType.APPROVED : ApprovalActionType.REJECTED,
        remark,
      },
    });

    return updatedRequest;
  });

  await createNotification(
    leaveRequest.employeeId,
    `Leave ${nextStatus.toLowerCase()}`,
    `Your leave from ${leaveRequest.startDate.toISOString().slice(0, 10)} was ${nextStatus.toLowerCase()}`
  );

  return updated;
}

export async function cancelLeaveRequest(actor, leaveRequestId, remark = "Cancelled by employee") {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
  });

  if (!leaveRequest) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave request not found");
  }

  if (actor.role === RoleName.EMPLOYEE && leaveRequest.employeeId !== actor.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only cancel your own leave requests");
  }

  if (leaveRequest.status === LeaveStatus.CANCELLED || leaveRequest.status === LeaveStatus.REJECTED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Request already closed");
  }

  if (leaveRequest.status === LeaveStatus.APPROVED && actor.role === RoleName.EMPLOYEE) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Approved leave cannot be cancelled by employee");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: LeaveStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await tx.approvalLog.create({
      data: {
        leaveRequestId,
        actionBy: actor.id,
        actionType: ApprovalActionType.CANCELLED,
        remark,
      },
    });

    return updated;
  });
}
