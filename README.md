# Leave Management Application

Production-structured full-stack Leave Management System built with:

- Next.js App Router + React for frontend
- Node.js + Express for backend API
- MySQL + Prisma for relational data modeling and access
- JWT authentication with role-based access control for EMPLOYEE, MANAGER, ADMIN

## 1) Folder Structure

### Backend Folder Structure

```
backend/
├── src/
│   ├── server.js                      → Entry point, starts Express server on port 5000
│   ├── app.js                         → Express app configuration, middleware setup, routes aggregation
│   │
│   ├── config/
│   │   ├── env.js                     → Environment variable loader (loads from .env)
│   │   └── prisma.js                  → Prisma Client singleton instance for database access
│   │
│   ├── constants/
│   │   └── roles.js                   → Role constants (EMPLOYEE, MANAGER, ADMIN)
│   │
│   ├── controllers/                   → HTTP request handlers - handles incoming requests & returns responses
│   │   ├── authController.js          → Login, register, JWT refresh token endpoints
│   │   ├── userController.js          → User CRUD operations (create, read, update, delete employees)
│   │   ├── departmentController.js    → Department management (CRUD operations)
│   │   ├── leaveTypeController.js     → Leave type configuration (Sick, Annual, Casual, etc.)
│   │   ├── leaveRequestController.js  → Submit, approve, reject, cancel leave requests
│   │   ├── leaveBalanceController.js  → View employee leave quotas and remaining balance
│   │   ├── dashboardController.js     → Dashboard data - analytics, summaries, statistics
│   │   ├── notificationController.js  → Fetch notifications, mark as read
│   │   └── reportController.js        → Generate leave reports and analytics
│   │
│   ├── services/                      → Business logic layer - implements core application rules
│   │   ├── authService.js             → Password hashing (bcrypt), JWT token generation & validation
│   │   ├── userService.js             → User business logic (validations, transformations)
│   │   ├── departmentService.js       → Department operations
│   │   ├── leaveTypeService.js        → Leave type operations
│   │   ├── leaveRequestService.js     → Leave approval workflow, balance validation, overlap checking
│   │   ├── leaveBalanceService.js     → Calculate used/remaining/carried forward leaves
│   │   ├── dashboardService.js        → Dashboard calculations and data aggregation
│   │   ├── notificationService.js     → Create and manage notifications
│   │   └── reportService.js           → Report generation logic
│   │
│   ├── middlewares/                   → Middleware functions - process requests before reaching controllers
│   │   ├── authMiddleware.js          → JWT verification, extract user info, attach to request
│   │   ├── roleMiddleware.js          → Role-based access control (require ADMIN, MANAGER, etc.)
│   │   ├── validateRequest.js         → Zod schema validation for request payloads
│   │   ├── uploadMiddleware.js        → Multer file upload handling for leave documents
│   │   └── errorHandler.js            → Global error catching, standardized error response formatting
│   │
│   ├── routes/                        → API endpoint definitions
│   │   ├── index.js                   → Central route aggregator, combines all routes
│   │   ├── authRoutes.js              → POST /auth/login, /auth/register, /auth/refresh
│   │   ├── userRoutes.js              → GET/POST/PUT /users endpoints
│   │   ├── leaveRequestRoutes.js      → GET/POST /leave-requests, PATCH approve/reject
│   │   ├── leaveBalanceRoutes.js      → GET /leave-balances endpoints
│   │   ├── departmentRoutes.js        → Department endpoints
│   │   ├── leaveTypeRoutes.js         → Leave type endpoints
│   │   ├── notificationRoutes.js      → Notification endpoints
│   │   ├── dashboardRoutes.js         → Dashboard data endpoints
│   │   └── reportRoutes.js            → Report generation endpoints
│   │
│   ├── validators/                    → Request payload validation schemas (Zod)
│   │   ├── authValidator.js           → Validation schemas for login/register (email, password format)
│   │   ├── leaveRequestValidator.js   → Validate leave request payloads (dates, reason, etc.)
│   │   └── adminValidator.js          → Validation schemas for admin operations
│   │
│   ├── utils/                         → Utility functions - reusable helper functions
│   │   ├── asyncHandler.js            → Wrapper to catch async/await errors in controllers
│   │   ├── ApiError.js                → Custom error class with HTTP status codes
│   │   ├── apiResponse.js             → Standardized JSON response format for all endpoints
│   │   ├── dateUtils.js               → Date calculations (business days, date validation)
│   │   └── pagination.js              → Offset/limit pagination helper for list endpoints
│   │
│   └── uploads/                       → Temporary folder storing uploaded leave request documents
│
├── prisma/
│   ├── schema.prisma                  → Prisma ORM schema definition (maps to MySQL database)
│   ├── migrations/                    → Auto-generated database migration history
│   │   └── [migration_folders]/       → Each migration is a version of schema changes
│   └── seed.js                        → Script to populate initial data (admins, employees, leave types)
│
├── package.json                       → Dependencies: Express, Prisma, JWT, bcrypt, Multer, Zod, Helmet, CORS
├── .env.example                       → Environment variable template (copy to .env)
└── .env                               → Actual environment variables (DATABASE_URL, JWT_SECRET, etc.)
```

**Backend Stack & Key Dependencies:**
- **Express.js** - Web framework
- **Prisma ORM** - Type-safe database access
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing & encryption
- **Zod** - Schema validation
- **Multer** - File upload handling
- **Helmet** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - DDoS protection
- **Morgan** - HTTP request logging

---

### Frontend Folder Structure

```
frontend/
├── src/
│   ├── app/                           → Next.js App Router pages (file-based routing)
│   │   ├── globals.css                → Global CSS styles applied to entire app
│   │   ├── layout.js                  → Root layout component, meta tags, main provider setup
│   │   ├── page.js                    → Home/landing page
│   │   │
│   │   ├── (auth)/                    → Route group for unauthenticated public pages
│   │   │   ├── login/
│   │   │   │   └── page.js            → Login form page, email/password input, JWT token handling
│   │   │   ├── register/
│   │   │   │   └── page.js            → Registration form, user signup, password validation
│   │   │   └── forgot-password/
│   │   │       └── page.js            → Password reset flow, email verification
│   │   │
│   │   └── (protected)/               → Route group for authenticated pages (wrapped with ProtectedLayout)
│   │       ├── layout.js              → Protected layout with sidebar, navbar, auth checks
│   │       │
│   │       ├── dashboard/             → Employee, Manager, and Admin dashboards
│   │       │   ├── page.js            → Default/Employee dashboard (my leaves, balance, pending requests)
│   │       │   ├── manager/
│   │       │   │   └── page.js        → Manager dashboard (team overview, pending approvals)
│   │       │   └── admin/
│   │       │       └── page.js        → Admin dashboard (system overview, statistics)
│   │       │
│   │       ├── leave/                 → Leave request management pages
│   │       │   ├── apply/
│   │       │   │   └── page.js        → Apply for new leave form (date picker, type selector, reason)
│   │       │   ├── my-requests/
│   │       │   │   └── page.js        → View my leave requests history, status, filters
│   │       │   └── team-requests/
│   │       │       └── page.js        → Manager: Review team's leave requests, approve/reject form
│   │       │
│   │       ├── admin/                 → Admin-only management pages
│   │       │   ├── employees/
│   │       │   │   └── page.js        → User management (add, edit, deactivate employees)
│   │       │   ├── departments/
│   │       │   │   └── page.js        → Department management (CRUD operations)
│   │       │   ├── leave-types/
│   │       │   │   └── page.js        → Configure leave types (create, edit, set allowance)
│   │       │   └── leave-balances/
│   │       │       └── page.js        → Adjust leave quotas for employees, carry forward
│   │       │
│   │       ├── reports/
│   │       │   └── page.js            → Leave analytics, statistics, reports (charts, tables)
│   │       ├── calendar/
│   │       │   └── page.js            → Leave calendar view
│   │       ├── notifications/
│   │       │   └── page.js            → View all notifications, mark as read
│   │       └── profile/
│   │           └── page.js            → User profile, settings, change password
│   │
│   ├── components/                    → Reusable UI components
│   │   ├── layout/
│   │   │   └── ProtectedLayout.js     → Wrapper component with sidebar, navbar, auth guard
│   │   │
│   │   └── ui/                        → Reusable UI primitives
│   │       ├── Button.js              → Styled button component (primary, secondary, danger)
│   │       ├── Input.js               → Form input field component (text, email, password, date)
│   │       ├── Card.js                → Card container component (sections, panels)
│   │       ├── Modal.js               → Modal dialog component (confirmations, forms)
│   │       ├── DataTable.js           → Sortable, paginated data table component
│   │       └── StatusBadge.js         → Status indicator badge (PENDING, APPROVED, REJECTED, etc.)
│   │
│   ├── features/                      → Domain-specific feature modules
│   │   └── auth/
│   │       └── AuthContext.js         → React Context for user authentication state, login/logout
│   │
│   ├── lib/                           → Utility libraries and helpers
│   │   ├── apiClient.js               → Axios instance with base URL, auth interceptor, error handling
│   │   ├── dateFormat.js              → Date formatting utilities (display dates in readable format)
│   │   └── colorUtils.js              → Color/theme utilities, styling helpers
│   │
│   ├── providers/
│   │   └── AppProviders.js            → Wraps app with AuthContext provider, TanStack Query client provider
│   │
│   └── jsconfig.json                  → Path aliases configuration (@/components, @/lib, etc.)
│
├── public/                            → Static assets (images, icons, fonts)
├── next.config.mjs                    → Next.js configuration
├── package.json                       → Dependencies: Next.js, React, Axios, TanStack Query, React Hook Form, Zod
├── .env.example                       → Environment variable template
└── .env.local                         → Actual environment variables (NEXT_PUBLIC_API_URL, etc.)
```

**Frontend Stack & Key Dependencies:**
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Axios** - HTTP client with interceptors
- **TanStack Query (React Query)** - Server state management, caching
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **CSS Modules / Tailwind CSS** - Styling

---

### Database Folder Structure

```
db/
├── schema.sql                         → Complete MySQL database schema with 10 tables, constraints, indexes
├── data.sql                           → Sample/seed data (users, departments, leave types, etc.)
└── queries.sql                        → Common SQL queries for testing and reference
```

---

### Documentation Folder Structure

```
docs/
├── architecture.md                    → System architecture overview, design patterns, layers
├── api-routes.md                      → Complete API endpoint documentation
└── implementation-roadmap.md          → Development roadmap and feature implementation details
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
