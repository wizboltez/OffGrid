import { prisma } from "../config/prisma.js";

export async function getMonthlyLeaveReport(month, year) {
  const fromDate = new Date(year, month - 1, 1);
  const toDate = new Date(year, month, 0, 23, 59, 59);

  const requests = await prisma.leaveRequest.findMany({
    where: {
      appliedAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: { employee: true, leaveType: true },
  });

  return {
    month,
    year,
    count: requests.length,
    requests,
  };
}
