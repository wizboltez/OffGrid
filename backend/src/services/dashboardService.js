import { LeaveStatus, RoleName } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function getEmployeeDashboard(userId) {
  const [balances, recentRequests, upcomingLeaves] = await Promise.all([
    prisma.leaveBalance.findMany({ where: { employeeId: userId }, include: { leaveType: true } }),
    prisma.leaveRequest.findMany({
      where: { employeeId: userId },
      orderBy: { appliedAt: "desc" },
      include: { leaveType: true },
      take: 5,
    }),
    prisma.leaveRequest.findMany({
      where: {
        employeeId: userId,
        status: LeaveStatus.APPROVED,
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      include: { leaveType: true },
      take: 5,
    }),
  ]);

  return { balances, recentRequests, upcomingLeaves };
}

export async function getManagerDashboard(managerId) {
  const teamMembers = await prisma.user.findMany({
    where: { managerId, role: { name: RoleName.EMPLOYEE } },
    select: { id: true },
  });
  const employeeIds = teamMembers.map((user) => user.id);

  const [pendingApprovals, teamOnLeaveToday, teamBalances] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { employeeId: { in: employeeIds }, status: LeaveStatus.PENDING },
      include: { employee: true, leaveType: true },
      take: 10,
      orderBy: { appliedAt: "desc" },
    }),
    prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: LeaveStatus.APPROVED,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: { employee: true, leaveType: true },
    }),
    prisma.leaveBalance.findMany({
      where: { employeeId: { in: employeeIds } },
      include: { employee: true, leaveType: true },
      take: 50,
    }),
  ]);

  return { pendingApprovals, teamOnLeaveToday, teamBalances };
}

export async function getAdminDashboard() {
  const [
    totalEmployees,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    departmentUsage,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { name: RoleName.EMPLOYEE }, isActive: true } }),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.APPROVED } }),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.REJECTED } }),
    prisma.department.findMany({
      include: {
        users: {
          include: {
            leaveRequests: true,
          },
        },
      },
    }),
  ]);

  const departmentWiseUsage = departmentUsage.map((department) => ({
    department: department.name,
    totalLeaveRequests: department.users.reduce((sum, user) => sum + user.leaveRequests.length, 0),
  }));

  return {
    totals: {
      totalEmployees,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    },
    departmentWiseUsage,
  };
}
