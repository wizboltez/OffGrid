# Exact Development Order

1. Define domain model and relational schema
2. Create Prisma models and migrations
3. Seed core roles, departments, leave types, and default users
4. Build auth flow (login/JWT)
5. Add RBAC middleware and route protection
6. Build user, department, and leave-type management APIs
7. Build leave request flow with validations and overlap/balance checks
8. Build approve/reject/cancel workflow with audit logs
9. Add dashboard aggregations and reporting endpoints
10. Implement notifications API
11. Build Next.js auth shell and protected layout
12. Build role dashboards and leave pages
13. Build admin management pages
14. Add UX states: loading, empty, error, pending actions
15. Harden for production: logging, tests, CI/CD, and monitoring

## Reusable Components List
- ProtectedLayout
- Button
- Input
- Card
- DataTable
- StatusBadge

## Future Improvements
- Refresh token rotation + revocation list
- Holiday and weekend exclusion calendar
- Full leave policy engine per department/grade
- Websocket live approvals and notification center updates
- CSV/PDF report export service
- Fine-grained audit diff logs
- Docker compose and deployment manifests
- Redis caching and queue workers for email and analytics
