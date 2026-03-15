import { prisma } from "../config/prisma.js";

export async function getMyLeaveBalances(userId) {
  return prisma.leaveBalance.findMany({
    where: { employeeId: userId },
    include: { leaveType: true },
    orderBy: { leaveType: { name: "asc" } },
  });
}

export async function adjustBalance({ employeeId, leaveTypeId, year, allocated, used }) {
  const remaining = allocated - used;
  return prisma.leaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId,
        leaveTypeId,
        year,
      },
    },
    update: {
      allocated,
      used,
      remaining,
    },
    create: {
      employeeId,
      leaveTypeId,
      year,
      allocated,
      used,
      remaining,
      carriedForward: 0,
    },
  });
}
