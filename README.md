# Leave Management Application

Production-structured full-stack Leave Management System built with:

- Next.js App Router + React for frontend
- Node.js + Express for backend API
- MySQL + Prisma for relational data modeling and access
- JWT authentication with role-based access control for EMPLOYEE, MANAGER, ADMIN

## 1) Folder Structure

```text
leave_management/
  backend/
    prisma/
      schema.prisma
      seed.js
    src/
      config/
      constants/
      controllers/
      middlewares/
      repositories/
      routes/
      services/
      types/
      utils/
      validators/
      app.js
      server.js
    uploads/
    package.json
    .env.example
  frontend/
    src/
      app/
        (auth)/
          login/
          register/
          forgot-password/
        (protected)/
          dashboard/employee/
          dashboard/manager/
          dashboard/admin/
          leave/apply/
          leave/my-requests/
          leave/team-requests/
          admin/employees/
          admin/departments/
          admin/leave-types/
          admin/leave-balances/
          reports/
          profile/
          notifications/
      components/
      features/
      lib/
      providers/
    package.json
    .env.example
  db/
    schema.sql
    data.sql
    queries.sql
  docs/
    architecture.md
    api-routes.md
    implementation-roadmap.md
```

## 2) Backend Setup

1. Copy environment:

   - backend/.env.example -> backend/.env

2. Install dependencies:

   - cd backend
   - npm install

3. Generate Prisma client and migrate:

   - npx prisma generate
   - npx prisma migrate dev --name init

4. Seed initial data:

   - npm run prisma:seed

5. Start backend:

   - npm run dev

Backend starts on http://localhost:5000

## 3) Frontend Setup

1. Copy environment:

   - frontend/.env.example -> frontend/.env.local

2. Install dependencies:

   - cd frontend
   - npm install

3. Start frontend:

   - npm run dev

Frontend starts on http://localhost:3000

## 4) Run Guide (First Time vs Every Time)

### First time only (one-time setup)

1. Start MySQL server and make sure your `DATABASE_URL` in `backend/.env` is correct.
2. Install backend dependencies:

  - `cd backend`
  - `npm install`

3. Initialize database and Prisma client:

  - `npx prisma generate`
  - `npx prisma migrate dev --name init`
  - `npm run prisma:seed`

4. Install frontend dependencies:

  - `cd ../frontend`
  - `npm install`

### Every time you run the project

1. Ensure MySQL is running.
2. Start backend (Terminal 1):

  - `cd backend`
  - `npm run dev`

3. Start frontend (Terminal 2):

  - `cd frontend`
  - `npm run dev`

4. Open the app:

  - Frontend: `http://localhost:3000`
  - Backend API: `http://localhost:5000`

### Do this only when needed

1. If you changed Prisma schema:

  - `cd backend`
  - `npx prisma migrate dev --name <change_name>`
  - `npm run prisma:seed` (if seed data was changed)

2. If frontend cache causes stale behavior:

  - `cd frontend`
  - delete `.next`
  - `npm run dev`

3. If port is already in use:

  - Stop the old process, or run with a different port.

## 5) Demo Credentials

- Admin
  - admin@company.com / Admin@12345

- Managers (team-wise)
  - Development: manager.dev@company.com / ManagerDev@12345
  - HR (additional manager): manager.hr@company.com / ManagerHr@12345
  - Finance (additional manager): manager.finance@company.com / ManagerFinance@12345

- Employees
  - Development
    - John Smith: dev.employee1@company.com / DevEmployee1@123
    - Emily Johnson: dev.employee2@company.com / DevEmployee2@123
    - Michael Brown: dev.employee3@company.com / DevEmployee3@123
  - HR
    - Olivia Davis: hr.employee1@company.com / HrEmployee1@123
    - James Wilson: hr.employee2@company.com / HrEmployee2@123
    - Sophia Martinez: hr.employee3@company.com / HrEmployee3@123
  - Finance
    - William Anderson: finance.employee1@company.com / FinanceEmployee1@123
    - Isabella Taylor: finance.employee2@company.com / FinanceEmployee2@123
    - Daniel Harris: finance.employee3@company.com / FinanceEmployee3@123

Added accounts requested:
- 8 additional employee logins
- 2 additional manager logins (HR and Finance)

## 6) API Response Format

Success:

```json
{
  "success": true,
  "message": "Leave request submitted",
  "data": {},
  "meta": null
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "REQUEST_ERROR",
    "details": {}
  }
}
```

## 7) Postman Collection Structure Idea

- Auth
  - POST /api/auth/register
  - POST /api/auth/login
- Users
  - GET /api/users/me
  - GET /api/users
- Departments
  - GET /api/departments
  - POST /api/departments
- Leave Types
  - GET /api/leave-types
  - POST /api/leave-types
- Leave Requests
  - POST /api/leave-requests
  - GET /api/leave-requests
  - PATCH /api/leave-requests/:id/approve
  - PATCH /api/leave-requests/:id/reject
  - PATCH /api/leave-requests/:id/cancel
- Leave Balances
  - GET /api/leave-balances/me
  - PATCH /api/leave-balances/adjust
- Dashboards
  - GET /api/dashboard/employee
  - GET /api/dashboard/manager
  - GET /api/dashboard/admin
- Reports
  - GET /api/reports/monthly
- Notifications
  - GET /api/notifications

## 8) Security and Scalability Notes

- Password hashing with bcrypt
- JWT-based stateless auth
- RBAC middleware by role
- Helmet and rate-limit middleware
- Input validation with Zod
- File upload controls and mime checks
- Prisma ORM to reduce SQL injection risk
- Layered architecture for easy extension to queues, Redis, email, event bus, and microservices
