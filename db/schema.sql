DROP DATABASE IF EXISTS leave_management;
CREATE DATABASE leave_management;
USE leave_management;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('EMPLOYEE', 'MANAGER', 'ADMIN') NOT NULL UNIQUE
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NULL,
    manager_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_users_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    default_allowance DECIMAL(5,2) NOT NULL,
    requires_document TINYINT(1) NOT NULL DEFAULT 0,
    carry_forward_allowed TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL,
    is_half_day TINYINT(1) NOT NULL DEFAULT 0,
    reason VARCHAR(500) NOT NULL,
    emergency_flag TINYINT(1) NOT NULL DEFAULT 0,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    manager_remark VARCHAR(500) NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    CONSTRAINT fk_leave_requests_employee FOREIGN KEY (employee_id) REFERENCES users(id),
    CONSTRAINT fk_leave_requests_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    CONSTRAINT fk_leave_requests_approver FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL,
    allocated DECIMAL(6,2) NOT NULL,
    used DECIMAL(6,2) NOT NULL DEFAULT 0,
    remaining DECIMAL(6,2) NOT NULL,
    carried_forward DECIMAL(6,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type_id, year),
    CONSTRAINT fk_leave_balances_employee FOREIGN KEY (employee_id) REFERENCES users(id),
    CONSTRAINT fk_leave_balances_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE approval_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_request_id INT NOT NULL,
    action_by INT NOT NULL,
    action_type ENUM('APPLIED', 'APPROVED', 'REJECTED', 'CANCELLED', 'OVERRIDDEN') NOT NULL,
    remark VARCHAR(500) NULL,
    action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_logs_leave_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id),
    CONSTRAINT fk_approval_logs_action_by FOREIGN KEY (action_by) REFERENCES users(id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_request_id INT NOT NULL,
    file_name VARCHAR(191) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachments_leave_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id)
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_leave_type_id ON leave_requests(leave_type_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_leave_type_id ON leave_balances(leave_type_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);