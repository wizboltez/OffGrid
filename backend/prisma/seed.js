import bcrypt from "bcryptjs";
import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Reset transactional leave data so repeated seeding gives a clean testing state.
  await prisma.$transaction([
    prisma.attachment.deleteMany({}),
    prisma.approvalLog.deleteMany({}),
    prisma.leaveRequest.deleteMany({}),
    prisma.notification.deleteMany({}),
  ]);

  const roles = [RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.ADMIN];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  const development = await prisma.department.upsert({
    where: { name: "Development" },
    update: { description: "Product and engineering delivery" },
    create: { name: "Development", description: "Product and engineering delivery" },
  });

  const hr = await prisma.department.upsert({
    where: { name: "HR" },
    update: { description: "People operations and workforce management" },
    create: { name: "HR", description: "People operations and workforce management" },
  });

  const finance = await prisma.department.upsert({
    where: { name: "Finance" },
    update: { description: "Payroll, budgeting, and audit" },
    create: { name: "Finance", description: "Payroll, budgeting, and audit" },
  });

  const leaveTypes = [
    {
      name: "Emergency",
      description: "Critical emergency leave",
      defaultAllowance: 6,
      requiresDocument: false,
      carryForwardAllowed: false,
    },
    {
      name: "Sick",
      description: "Health related leave",
      defaultAllowance: 10,
      requiresDocument: true,
      carryForwardAllowed: false,
    },
    {
      name: "Maternity",
      description: "Maternity support leave",
      defaultAllowance: 90,
      requiresDocument: true,
      carryForwardAllowed: false,
    },
    {
      name: "Bereavement",
      description: "Compassionate bereavement leave",
      defaultAllowance: 7,
      requiresDocument: false,
      carryForwardAllowed: false,
    },
    {
      name: "Casual",
      description: "General personal leave",
      defaultAllowance: 12,
      requiresDocument: false,
      carryForwardAllowed: true,
    },
    {
      name: "Annual",
      description: "Annual planned leave",
      defaultAllowance: 15,
      requiresDocument: false,
      carryForwardAllowed: true,
    },
    {
      name: "Comp Off",
      description: "Compensatory off leave",
      defaultAllowance: 8,
      requiresDocument: false,
      carryForwardAllowed: true,
    },
    {
      name: "Unpaid",
      description: "Leave without pay",
      defaultAllowance: 365,
      requiresDocument: false,
      carryForwardAllowed: false,
    },
    {
      name: "Optional",
      description: "Optional holiday leave",
      defaultAllowance: 3,
      requiresDocument: false,
      carryForwardAllowed: false,
    },
    {
      name: "Study",
      description: "Study and examination leave",
      defaultAllowance: 5,
      requiresDocument: true,
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

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {
      fullName: "System Admin",
      departmentId: hr.id,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      fullName: "System Admin",
      email: "admin@company.com",
      passwordHash: await bcrypt.hash("Admin@12345", 12),
      roleId: adminRole.id,
      departmentId: hr.id,
    },
  });

  const legacyDevManager = await prisma.user.findUnique({
    where: { email: "manager@company.com" },
    include: { role: true },
  });

  const devManagerByNewEmail = await prisma.user.findUnique({
    where: { email: "manager.dev@company.com" },
  });

  if (legacyDevManager && legacyDevManager.role.name === RoleName.MANAGER && !devManagerByNewEmail) {
    await prisma.user.update({
      where: { id: legacyDevManager.id },
      data: { email: "manager.dev@company.com", fullName: "Development Manager" },
    });
  }

  const devManager = await prisma.user.upsert({
    where: { email: "manager.dev@company.com" },
    update: {
      fullName: "Development Manager",
      roleId: managerRole.id,
      departmentId: development.id,
      passwordHash: await bcrypt.hash("ManagerDev@12345", 12),
      isActive: true,
    },
    create: {
      fullName: "Development Manager",
      email: "manager.dev@company.com",
      passwordHash: await bcrypt.hash("ManagerDev@12345", 12),
      roleId: managerRole.id,
      departmentId: development.id,
    },
  });

  const hrManager = await prisma.user.upsert({
    where: { email: "manager.hr@company.com" },
    update: {
      fullName: "HR Manager",
      roleId: managerRole.id,
      departmentId: hr.id,
      passwordHash: await bcrypt.hash("ManagerHr@12345", 12),
      isActive: true,
    },
    create: {
      fullName: "HR Manager",
      email: "manager.hr@company.com",
      passwordHash: await bcrypt.hash("ManagerHr@12345", 12),
      roleId: managerRole.id,
      departmentId: hr.id,
    },
  });

  const financeManager = await prisma.user.upsert({
    where: { email: "manager.finance@company.com" },
    update: {
      fullName: "Finance Manager",
      roleId: managerRole.id,
      departmentId: finance.id,
      passwordHash: await bcrypt.hash("ManagerFinance@12345", 12),
      isActive: true,
    },
    create: {
      fullName: "Finance Manager",
      email: "manager.finance@company.com",
      passwordHash: await bcrypt.hash("ManagerFinance@12345", 12),
      roleId: managerRole.id,
      departmentId: finance.id,
    },
  });

  const seededEmployees = [
    {
      fullName: "John Smith",
      email: "dev.employee1@company.com",
      password: "DevEmployee1@123",
      departmentId: development.id,
      managerId: devManager.id,
    },
    {
      fullName: "Emily Johnson",
      email: "dev.employee2@company.com",
      password: "DevEmployee2@123",
      departmentId: development.id,
      managerId: devManager.id,
    },
    {
      fullName: "Michael Brown",
      email: "dev.employee3@company.com",
      password: "DevEmployee3@123",
      departmentId: development.id,
      managerId: devManager.id,
    },
    {
      fullName: "Olivia Davis",
      email: "hr.employee1@company.com",
      password: "HrEmployee1@123",
      departmentId: hr.id,
      managerId: hrManager.id,
    },
    {
      fullName: "James Wilson",
      email: "hr.employee2@company.com",
      password: "HrEmployee2@123",
      departmentId: hr.id,
      managerId: hrManager.id,
    },
    {
      fullName: "Sophia Martinez",
      email: "hr.employee3@company.com",
      password: "HrEmployee3@123",
      departmentId: hr.id,
      managerId: hrManager.id,
    },
    {
      fullName: "William Anderson",
      email: "finance.employee1@company.com",
      password: "FinanceEmployee1@123",
      departmentId: finance.id,
      managerId: financeManager.id,
    },
    {
      fullName: "Isabella Taylor",
      email: "finance.employee2@company.com",
      password: "FinanceEmployee2@123",
      departmentId: finance.id,
      managerId: financeManager.id,
    },
    {
      fullName: "Daniel Harris",
      email: "finance.employee3@company.com",
      password: "FinanceEmployee3@123",
      departmentId: finance.id,
      managerId: financeManager.id,
    },
  ];

  const employees = [];
  for (const employee of seededEmployees) {
    const record = await prisma.user.upsert({
      where: { email: employee.email },
      update: {
        fullName: employee.fullName,
        roleId: employeeRole.id,
        departmentId: employee.departmentId,
        managerId: employee.managerId,
        passwordHash: await bcrypt.hash(employee.password, 12),
        isActive: true,
      },
      create: {
        fullName: employee.fullName,
        email: employee.email,
        passwordHash: await bcrypt.hash(employee.password, 12),
        roleId: employeeRole.id,
        departmentId: employee.departmentId,
        managerId: employee.managerId,
      },
    });
    employees.push(record);
  }

  const managerUsers = [devManager, hrManager, financeManager];

  const allUsers = [admin, ...managerUsers, ...employees];

  const legacyEmployee = await prisma.user.findFirst({
    where: { email: "employee@company.com" },
    include: { role: true },
  });

  const newEmployeeEmailExists = await prisma.user.findUnique({
    where: { email: "dev.employee1@company.com" },
  });

  if (legacyEmployee && legacyEmployee.role.name === RoleName.EMPLOYEE && !newEmployeeEmailExists) {
    await prisma.user.update({
      where: { id: legacyEmployee.id },
      data: {
        email: "dev.employee1@company.com",
        fullName: "John Smith",
        passwordHash: await bcrypt.hash("DevEmployee1@123", 12),
      },
    });
  }

  if (legacyEmployee && legacyEmployee.role.name === RoleName.EMPLOYEE && newEmployeeEmailExists) {
    await prisma.user.update({
      where: { id: legacyEmployee.id },
      data: {
        isActive: false,
        managerId: null,
      },
    });
  }

  if (legacyEmployee && legacyEmployee.role.name !== RoleName.EMPLOYEE) {
    throw new Error("employee@company.com exists with non-EMPLOYEE role; please fix this record manually");
  }

  const leaveTypeRows = await prisma.leaveType.findMany({ where: { isActive: true } });
  const year = new Date().getFullYear();

  for (const leaveType of leaveTypeRows) {
    for (const user of allUsers) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: user.id,
            leaveTypeId: leaveType.id,
            year,
          },
        },
        update: {
          allocated: leaveType.defaultAllowance,
          used: 0,
          remaining: leaveType.defaultAllowance,
          carriedForward: 0,
        },
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
