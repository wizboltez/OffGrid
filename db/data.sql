USE leave_management;

INSERT INTO roles (name) VALUES
('EMPLOYEE'),
('MANAGER'),
('ADMIN');

INSERT INTO departments (name, description) VALUES
('Engineering', 'Engineering and platform teams'),
('Human Resources', 'People and operations'),
('Finance', 'Finance and compliance');

INSERT INTO leave_types (name, description, default_allowance, requires_document, carry_forward_allowed, is_active) VALUES
('Casual Leave', 'General short leave', 12.00, 0, 1, 1),
('Sick Leave', 'Health related leave', 10.00, 1, 0, 1),
('Earned Leave', 'Earned annual leave', 15.00, 0, 1, 1),
('Unpaid Leave', 'Leave without pay', 999.00, 0, 0, 1),
('Maternity/Paternity Leave', 'Special parental leave', 90.00, 1, 0, 1);

INSERT INTO users (full_name, email, password_hash, role_id, department_id, manager_id, is_active) VALUES
('System Admin', 'admin@company.com', '$2a$12$8S5rMCR2Hbe.5DzhBimVdOB0wXodZ6KvJvJvt6txLOQwJQn4qecqW', 3, 2, NULL, 1),
('Engineering Manager', 'manager@company.com', '$2a$12$8S5rMCR2Hbe.5DzhBimVdOB0wXodZ6KvJvJvt6txLOQwJQn4qecqW', 2, 1, NULL, 1),
('Default Employee', 'employee@company.com', '$2a$12$8S5rMCR2Hbe.5DzhBimVdOB0wXodZ6KvJvJvt6txLOQwJQn4qecqW', 1, 1, 2, 1),
('Finance Employee', 'finance@company.com', '$2a$12$8S5rMCR2Hbe.5DzhBimVdOB0wXodZ6KvJvJvt6txLOQwJQn4qecqW', 1, 3, 2, 1);

INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated, used, remaining, carried_forward)
SELECT u.id, lt.id, 2026, lt.default_allowance, 0, lt.default_allowance, 0
FROM users u
CROSS JOIN leave_types lt;

INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, is_half_day, reason, emergency_flag, status, manager_remark, approved_by, approved_at)
VALUES
(3, 1, '2026-04-10', '2026-04-12', 3.00, 0, 'Family vacation', 0, 'APPROVED', 'Approved. Plan handover.', 2, NOW()),
(4, 2, '2026-04-14', '2026-04-14', 0.50, 1, 'Medical checkup', 1, 'PENDING', NULL, NULL, NULL);

INSERT INTO approval_logs (leave_request_id, action_by, action_type, remark)
VALUES
(1, 3, 'APPLIED', 'Leave request created'),
(1, 2, 'APPROVED', 'Approved by manager'),
(2, 4, 'APPLIED', 'Emergency leave applied');

INSERT INTO notifications (user_id, title, message, is_read)
VALUES
(2, 'New leave request', 'Finance Employee has applied for leave', 0),
(3, 'Leave approved', 'Your leave request from 2026-04-10 to 2026-04-12 is approved', 0);