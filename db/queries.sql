USE leave_management;

-- 1. Employee list with role and department
SELECT u.id, u.full_name, u.email, r.name AS role, d.name AS department, u.is_active
FROM users u
JOIN roles r ON r.id = u.role_id
LEFT JOIN departments d ON d.id = u.department_id
ORDER BY u.created_at DESC;

-- 2. All pending requests for a manager's direct reports
SELECT lr.id, u.full_name AS employee, lt.name AS leave_type, lr.start_date, lr.end_date, lr.total_days, lr.status
FROM leave_requests lr
JOIN users u ON u.id = lr.employee_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
WHERE u.manager_id = 2 AND lr.status = 'PENDING'
ORDER BY lr.applied_at DESC;

-- 3. Overlap check query used before applying leave
SELECT COUNT(*) AS overlap_count
FROM leave_requests
WHERE employee_id = 3
	AND status IN ('PENDING', 'APPROVED')
	AND start_date <= '2026-04-15'
	AND end_date >= '2026-04-11';

-- 4. Employee leave balance view
SELECT lb.employee_id, u.full_name, lt.name AS leave_type, lb.year, lb.allocated, lb.used, lb.remaining
FROM leave_balances lb
JOIN users u ON u.id = lb.employee_id
JOIN leave_types lt ON lt.id = lb.leave_type_id
WHERE lb.employee_id = 3 AND lb.year = 2026;

-- 5. Department leave trend
SELECT d.name AS department, COUNT(lr.id) AS total_requests,
			 SUM(CASE WHEN lr.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
			 SUM(CASE WHEN lr.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
LEFT JOIN leave_requests lr ON lr.employee_id = u.id
GROUP BY d.name
ORDER BY total_requests DESC;

-- 6. Monthly analytics
SELECT DATE_FORMAT(applied_at, '%Y-%m') AS month_bucket,
			 COUNT(*) AS total,
			 SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
			 SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
			 SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending
FROM leave_requests
GROUP BY month_bucket
ORDER BY month_bucket DESC;

-- 7. Team leave calendar list for manager
SELECT u.full_name, lr.start_date, lr.end_date, lr.status
FROM leave_requests lr
JOIN users u ON u.id = lr.employee_id
WHERE u.manager_id = 2
	AND lr.status = 'APPROVED'
ORDER BY lr.start_date ASC;

-- 8. Notifications inbox by user
SELECT id, title, message, is_read, created_at
FROM notifications
WHERE user_id = 3
ORDER BY created_at DESC;

-- 9. Sample pagination and sorting for all requests
SELECT lr.id, u.full_name, lt.name, lr.status, lr.applied_at
FROM leave_requests lr
JOIN users u ON u.id = lr.employee_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
ORDER BY lr.applied_at DESC
LIMIT 10 OFFSET 0;

-- 10. Optional CSV-export ready report data set
SELECT u.full_name, d.name AS department, lt.name AS leave_type, lr.start_date, lr.end_date, lr.total_days, lr.status
FROM leave_requests lr
JOIN users u ON u.id = lr.employee_id
LEFT JOIN departments d ON d.id = u.department_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
ORDER BY lr.start_date DESC;
