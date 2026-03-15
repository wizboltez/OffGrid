# Key API Routes

## Auth

- POST /api/auth/register
- POST /api/auth/login

## Users

- GET /api/users/me
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- PATCH /api/users/:id/status
- DELETE /api/users/:id

## Departments

- GET /api/departments
- POST /api/departments
- PUT /api/departments/:id
- DELETE /api/departments/:id

## Leave Types

- GET /api/leave-types
- POST /api/leave-types
- PUT /api/leave-types/:id
- DELETE /api/leave-types/:id

## Leave Requests

- GET /api/leave-requests
- POST /api/leave-requests
- PATCH /api/leave-requests/:id/approve
- PATCH /api/leave-requests/:id/reject
- PATCH /api/leave-requests/:id/cancel

## Leave Balances

- GET /api/leave-balances/me
- PATCH /api/leave-balances/adjust

## Dashboards

- GET /api/dashboard/employee
- GET /api/dashboard/manager
- GET /api/dashboard/admin

## Reports

- GET /api/reports/monthly

## Notifications

- GET /api/notifications
