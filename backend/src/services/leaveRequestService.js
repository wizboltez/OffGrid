import { ApprovalActionType, LeaveStatus, RoleName } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateLeaveDays, isPastDate, toDateOnly } from "../utils/dateUtils.js";
import { getPaginationParams } from "../utils/pagination.js";
import { createNotification } from "./notificationService.js";

const LEAVE_PRIORITY = {
  emergency: 1,
  sick: 2,
  medical: 2,
  maternity: 3,
  bereavement: 4,
  casual: 5,
  annual: 6,
  "comp off": 7,
  unpaid: 8,
  optional: 9,
  study: 10,
};

const MAX_TEAM_LEAVES_AT_ONCE = 2;

function resolveLeavePriority(leaveTypeName) {
  const normalized = String(leaveTypeName || "").toLowerCase();

  for (const [keyword, priority] of Object.entries(LEAVE_PRIORITY)) {
    if (normalized.includes(keyword)) {
      return priority;
    }
  }

  return 999;
}

async function getTeamEmployeeIds(user) {
  if (user.role !== RoleName.EMPLOYEE || !user.managerId) {
    return [];
  }

  const team = await prisma.user.findMany({
    where: {
      managerId: user.managerId,
      isActive: true,
      role: { name: RoleName.EMPLOYEE },
    },
    select: { id: true },
  });

  return team.map((member) => member.id);
}

async function revokeByPriorityIfNeeded({ actor, newRequest, conflictingRequest }) {
  const autoActorId = actor.managerId || actor.id;
  const reason = `This leave was auto-revoked to maintain minimum workforce requirements. A higher priority leave request from ${newRequest.employee.fullName} was approved for the same period. Please contact your manager for alternative dates.`;

  const revoked = await prisma.$transaction(async (tx) => {
    const existing = await tx.leaveRequest.findUnique({
      where: { id: conflictingRequest.id },
      include: { leaveType: true, employee: true },
    });

    if (!existing || ![LeaveStatus.PENDING, LeaveStatus.APPROVED].includes(existing.status)) {
      return null;
    }

    const updated = await tx.leaveRequest.update({
      where: { id: existing.id },
      data: {
        status: LeaveStatus.REJECTED,
        managerRemark: reason,
        approvedBy: autoActorId,
        approvedAt: new Date(),
      },
      include: { leaveType: true, employee: true },
    });

    if (existing.status === LeaveStatus.APPROVED) {
      const year = new Date(existing.startDate).getFullYear();
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: existing.employeeId,
            leaveTypeId: existing.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        const days = Number(existing.totalDays);
        const newUsed = Math.max(0, Number(balance.used) - days);
        const newRemaining = Number(balance.allocated) - newUsed + Number(balance.carriedForward);
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: newUsed,
            remaining: newRemaining,
          },
        });
      }
    }

    await tx.approvalLog.create({
      data: {
        leaveRequestId: existing.id,
        actionBy: autoActorId,
        actionType: ApprovalActionType.OVERRIDDEN,
        remark: reason,
      },
    });

    return updated;
  });

  if (revoked) {
    await createNotification(
      revoked.employeeId,
      "Leave Request Auto-Revoked",
      `Your ${revoked.leaveType.name} leave for ${revoked.startDate.toISOString().slice(0, 10)} to ${revoked.endDate.toISOString().slice(0, 10)} has been automatically revoked to maintain minimum workforce levels.`
    );
  }

  return revoked;
}

async function getPriorityRevocationCandidate(user, startDate, endDate, leaveTypeId) {
  const teamEmployeeIds = await getTeamEmployeeIds(user);

  if (teamEmployeeIds.length <= 1) {
    return null;
  }

  const otherTeamEmployeeIds = teamEmployeeIds.filter((id) => id !== user.id);
  if (otherTeamEmployeeIds.length === 0) {
    return null;
  }

  const overlappingRequests = await prisma.leaveRequest.findMany({
    where: {
      employeeId: { in: otherTeamEmployeeIds },
      status: LeaveStatus.APPROVED,
      AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
    },
    include: {
      employee: { select: { id: true, fullName: true } },
      leaveType: { select: { id: true, name: true } },
    },
  });

  const requestedLeaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
  const requestedPriority = resolveLeavePriority(requestedLeaveType?.name);
  const maxAllowedOnLeave = Math.min(MAX_TEAM_LEAVES_AT_ONCE, Math.max(0, teamEmployeeIds.length - 1));

  if (overlappingRequests.length < maxAllowedOnLeave) {
    return null;
  }

  const sortedByLowestPriority = [...overlappingRequests].sort((a, b) => {
    const aPriority = resolveLeavePriority(a.leaveType?.name);
    const bPriority = resolveLeavePriority(b.leaveType?.name);

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    const aAppliedAt = new Date(a.appliedAt).getTime();
    const bAppliedAt = new Date(b.appliedAt).getTime();
    if (aAppliedAt !== bAppliedAt) {
      return bAppliedAt - aAppliedAt;
    }

    return b.id - a.id;
  });

  const candidate = sortedByLowestPriority[0];
  const candidatePriority = resolveLeavePriority(candidate.leaveType?.name);

  if (requestedPriority < candidatePriority) {
    return candidate;
  }

  throw new ApiError(
    StatusCodes.CONFLICT,
    "At least one team member must remain available for those dates. Submit a higher priority leave type if this is urgent."
  );
}

async function getPriorityRevocationCandidateForEmployee(employee, startDate, endDate, leaveTypeId) {
  return getPriorityRevocationCandidate(
    {
      id: employee.id,
      role: RoleName.EMPLOYEE,
      managerId: employee.managerId,
    },
    startDate,
    endDate,
    leaveTypeId
  );
}

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

async function hasOverlappingLeave(employeeId, startDate, endDate, excludeRequestId = null) {
  const count = await prisma.leaveRequest.count({
    where: {
      employeeId,
      status: LeaveStatus.APPROVED,
      ...(excludeRequestId ? { id: { not: excludeRequestId } } : {}),
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
    throw new ApiError(StatusCodes.CONFLICT, "You already have an approved leave that overlaps these dates");
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

export async function updateLeaveRequest(actor, leaveRequestId, payload) {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: { employee: true },
  });

  if (!leaveRequest) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave request not found");
  }

  if (actor.role === RoleName.EMPLOYEE && leaveRequest.employeeId !== actor.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only update your own leave requests");
  }

  if (leaveRequest.status !== LeaveStatus.PENDING) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Only pending leave requests can be updated");
  }

  const startDate = toDateOnly(payload.startDate);
  const endDate = toDateOnly(payload.endDate);

  if (startDate > endDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Start date cannot be after end date");
  }

  if (!env.allowPastLeaveApply && isPastDate(startDate) && actor.role !== RoleName.ADMIN) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot apply leave for past dates");
  }

  const totalDays = calculateLeaveDays(startDate, endDate, payload.isHalfDay);
  if (totalDays <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid leave date range");
  }

  const overlap = await hasOverlappingLeave(leaveRequest.employeeId, startDate, endDate, leaveRequest.id);
  if (overlap) {
    throw new ApiError(StatusCodes.CONFLICT, "You already have an approved leave that overlaps these dates");
  }

  const year = startDate.getFullYear();
  const balance = await ensureBalance(leaveRequest.employeeId, payload.leaveTypeId, year);
  if (Number(balance.remaining) < Number(totalDays)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient leave balance");
  }

  return prisma.leaveRequest.update({
    where: { id: leaveRequest.id },
    data: {
      leaveTypeId: payload.leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason: payload.reason,
      isHalfDay: payload.isHalfDay,
      emergencyFlag: payload.emergencyFlag,
    },
    include: {
      employee: true,
      leaveType: true,
      attachments: true,
    },
  });
}

export async function deleteLeaveRequest(actor, leaveRequestId) {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
  });

  if (!leaveRequest) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Leave request not found");
  }

  if (actor.role === RoleName.EMPLOYEE && leaveRequest.employeeId !== actor.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own leave requests");
  }

  if (leaveRequest.status === LeaveStatus.APPROVED) {
    return cancelLeaveRequest(actor, leaveRequestId, "Deleted by employee");
  }

  await prisma.$transaction(async (tx) => {
    await tx.attachment.deleteMany({ where: { leaveRequestId } });
    await tx.approvalLog.deleteMany({ where: { leaveRequestId } });
    await tx.leaveRequest.delete({ where: { id: leaveRequestId } });
  });

  return { id: leaveRequestId, deleted: true };
}

export async function listLeaveRequests(user, query) {
  const { page, pageSize, skip, take } = getPaginationParams(query);
  const where = {};
  const isCalendarScope = query.scope === "calendar";
  const isMineScope = query.scope === "mine";

  if (user.role === RoleName.EMPLOYEE && isCalendarScope) {
    where.employee = user.managerId
      ? { managerId: user.managerId }
      : {
          departmentId: user.departmentId || undefined,
          role: { name: RoleName.EMPLOYEE },
        };
  } else if (user.role === RoleName.EMPLOYEE) {
    where.employeeId = user.id;
  }

  if (user.role === RoleName.MANAGER && isCalendarScope) {
    where.OR = [{ employee: { managerId: user.id } }, { employeeId: user.id }];
  } else if (user.role === RoleName.MANAGER && isMineScope) {
    where.employeeId = user.id;
  } else if (user.role === RoleName.MANAGER) {
    where.employee = { managerId: user.id };
  }

  if (user.role === RoleName.ADMIN && isMineScope) {
    where.employeeId = user.id;
  }

  if (isCalendarScope) {
    where.status = LeaveStatus.APPROVED;
  }

  if (query.status && !isCalendarScope) {
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
        employee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: { select: { name: true } },
          },
        },
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

  let revocationCandidate = null;
  if (nextStatus === LeaveStatus.APPROVED) {
    revocationCandidate = await getPriorityRevocationCandidateForEmployee(
      leaveRequest.employee,
      leaveRequest.startDate,
      leaveRequest.endDate,
      leaveRequest.leaveTypeId
    );
  }

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

  const notificationTitle = nextStatus === LeaveStatus.APPROVED ? "Leave Approved" : "Leave Request Rejected";
  const reasonText = remark ? ` Reason: ${remark}` : "";
  const notificationMessage = 
    nextStatus === LeaveStatus.APPROVED
      ? `Your ${leaveRequest.leaveType.name} leave from ${leaveRequest.startDate.toISOString().slice(0, 10)} to ${leaveRequest.endDate.toISOString().slice(0, 10)} has been approved.`
      : `Your ${leaveRequest.leaveType.name} leave request from ${leaveRequest.startDate.toISOString().slice(0, 10)} to ${leaveRequest.endDate.toISOString().slice(0, 10)} has been rejected.${reasonText}`;

  await createNotification(
    leaveRequest.employeeId,
    notificationTitle,
    notificationMessage
  );

  if (nextStatus === LeaveStatus.APPROVED && revocationCandidate) {
    await revokeByPriorityIfNeeded({
      actor,
      newRequest: leaveRequest,
      conflictingRequest: revocationCandidate,
    });
  }

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
    const startDate = toDateOnly(leaveRequest.startDate);
    const today = toDateOnly(new Date());
    const diffDays = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Approved leave can only be cancelled at least 1 day before start date");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: LeaveStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    if (leaveRequest.status === LeaveStatus.APPROVED) {
      const year = new Date(leaveRequest.startDate).getFullYear();
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: leaveRequest.employeeId,
            leaveTypeId: leaveRequest.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        const days = Number(leaveRequest.totalDays);
        const newUsed = Math.max(0, Number(balance.used) - days);
        const newRemaining = Number(balance.allocated) - newUsed + Number(balance.carriedForward);
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: newUsed,
            remaining: newRemaining,
          },
        });
      }
    }

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

  await createNotification(
    leaveRequest.employeeId,
    "Leave cancelled",
    `Your leave for ${toDateOnly(leaveRequest.startDate).toISOString().slice(0, 10)} was cancelled.`
  );

  return updated;
}
