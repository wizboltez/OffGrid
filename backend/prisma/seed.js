import bcrypt from "bcryptjs";
import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.ADMIN];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering", description: "Product and platform team" },
  });

  const hr = await prisma.department.upsert({
    where: { name: "Human Resources" },
    update: {},
    create: { name: "Human Resources", description: "People operations" },
  });

  const leaveTypes = [
    {
      name: "Casual Leave",
      description: "General personal leave",
      defaultAllowance: 12,
      requiresDocument: false,
      carryForwardAllowed: true,
    },
    {
      name: "Sick Leave",
      description: "Health related leave",
      defaultAllowance: 10,
      requiresDocument: true,
      carryForwardAllowed: false,
    },
    {
      name: "Earned Leave",
      description: "Accrued paid leave",
      defaultAllowance: 15,
      requiresDocument: false,
      carryForwardAllowed: true,
    },
    {
      name: "Unpaid Leave",
      description: "Leave without pay",
      defaultAllowance: 999,
      requiresDocument: false,
      carryForwardAllowed: false,
    },
  ];

  for (const leaveType of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { name: leaveType.name },
      update: leaveType,
      create: leaveType,
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.ADMIN } });
  const managerRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.MANAGER } });
  const employeeRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.EMPLOYEE } });

  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      fullName: "System Admin",
      email: "admin@company.com",
      passwordHash,
      roleId: adminRole.id,
      departmentId: hr.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@company.com" },
    update: {},
    create: {
      fullName: "Engineering Manager",
      email: "manager@company.com",
      passwordHash: await bcrypt.hash("Manager@12345", 12),
      roleId: managerRole.id,
      departmentId: engineering.id,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@company.com" },
    update: {},
    create: {
      fullName: "Default Employee",
      email: "employee@company.com",
      passwordHash: await bcrypt.hash("Employee@12345", 12),
      roleId: employeeRole.id,
      departmentId: engineering.id,
      managerId: manager.id,
    },
  });

  const leaveTypeRows = await prisma.leaveType.findMany({ where: { isActive: true } });
  const year = new Date().getFullYear();

  for (const leaveType of leaveTypeRows) {
    for (const user of [admin, manager, employee]) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: user.id,
            leaveTypeId: leaveType.id,
            year,
          },
        },
        update: {},
        create: {
          employeeId: user.id,
          leaveTypeId: leaveType.id,
          year,
          allocated: leaveType.defaultAllowance,
          used: 0,
          remaining: leaveType.defaultAllowance,
          carriedForward: 0,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
