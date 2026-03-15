CREATE TABLE Department (
    DeptID INT AUTO_INCREMENT,
    DeptName VARCHAR(100) NOT NULL,
    PRIMARY KEY (DeptID),
    UNIQUE (DeptName)
);

CREATE TABLE Team (
    TeamID INT AUTO_INCREMENT,
    DeptID INT,
    MinManPower INT NOT NULL,
    MaxConcurrentLeaves INT NOT NULL,
    PRIMARY KEY (TeamID),
    FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

CREATE TABLE Employee (
    EmployeeID INT AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    PriorityLevel INT CHECK (PriorityLevel BETWEEN 1 AND 5),
    WorkMode VARCHAR(20),
    TeamID INT,
    PRIMARY KEY (EmployeeID),
    FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

CREATE TABLE TeamLead (
    EmployeeID INT,
    ApprovalAuthorityLevel INT,
    PRIMARY KEY (EmployeeID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

CREATE TABLE LeaveBalance (
    BalanceID INT AUTO_INCREMENT,
    EmployeeID INT,
    TotalLeaves INT DEFAULT 20,
    UsedLeaves INT DEFAULT 0,
    Year YEAR,
    LastUpdated DATE,
    PRIMARY KEY (BalanceID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

CREATE TABLE LeaveRequest (
    LeaveID INT AUTO_INCREMENT,
    EmployeeID INT,
    StartDate DATE,
    EndDate DATE,
    Reason VARCHAR(255),
    RequestDate DATE,
    PRIMARY KEY (LeaveID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

CREATE TABLE LeaveApproval (
    ApprovalID INT AUTO_INCREMENT,
    LeaveID INT,
    ApprovedBy INT,
    ApprovalStatus VARCHAR(20),
    ApprovalDate DATE,
    Remarks VARCHAR(255),
    PRIMARY KEY (ApprovalID),
    FOREIGN KEY (LeaveID) REFERENCES LeaveRequest(LeaveID),
    FOREIGN KEY (ApprovedBy) REFERENCES Employee(EmployeeID)
);

CREATE INDEX idx_employee_team
ON Employee(TeamID);

CREATE INDEX idx_leave_dates
ON LeaveRequest(StartDate, EndDate);