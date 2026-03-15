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

## 4) Demo Credentials

- Admin: admin@company.com / Admin@12345
- Manager: manager@company.com / Manager@12345
- Employee: employee@company.com / Employee@12345

## 5) API Response Format

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

## 6) Postman Collection Structure Idea

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

## 7) Security and Scalability Notes

- Password hashing with bcrypt
- JWT-based stateless auth
- RBAC middleware by role
- Helmet and rate-limit middleware
- Input validation with Zod
- File upload controls and mime checks
- Prisma ORM to reduce SQL injection risk
- Layered architecture for easy extension to queues, Redis, email, event bus, and microservices
