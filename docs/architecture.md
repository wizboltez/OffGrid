# Architecture Overview

## Backend Layers

- routes: API endpoints and middleware chaining
- controllers: HTTP-only concerns and standardized responses
- services: business logic, workflows, and policy checks
- repositories/data-access: reserved for future dedicated query units
- validators: request contract validation with Zod
- middlewares: auth, role checks, validation, upload, error handler
- utils: pagination, dates, async wrapper, API response helper
- config: env and Prisma client

## Frontend Layers

- app router: route segments for auth and protected spaces
- providers: auth state + query client
- lib: Axios API client + auth interceptor
- components: reusable UI and layout primitives
- features: domain modules for auth and leave workflows

## Core Business Rules Implemented

- no overlapping requests for same employee in pending or approved status
- balance check before leave request submission
- required document enforcement for configured leave types
- manager can only approve/reject direct report requests
- employee cannot cancel other users' leaves
- processed requests cannot be approved/rejected again
- start date/end date and past-date validations

## Notification-Ready Design

Notification service centralizes in-app message writes and can be swapped with:

- SMTP/transactional mail sender
- queue-based workers
- push/websocket channels
