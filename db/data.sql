INSERT INTO Department (DeptName) VALUES
('IT'),
('HR'),
('Finance');

INSERT INTO Team (DeptID, MinManPower, MaxConcurrentLeaves) VALUES
(1,3,2),
(1,4,2),
(2,2,1),
(3,3,1);

INSERT INTO Employee (Name, PriorityLevel, WorkMode, TeamID) VALUES
('Rahul Sharma',2,'Remote',1),
('Sneha Patil',3,'Hybrid',1),
('Amit Joshi',1,'Onsite',2),
('Priya Singh',4,'Remote',2),
('Karan Mehta',2,'Hybrid',3),
('Neha Kulkarni',3,'Onsite',4);

INSERT INTO TeamLead (EmployeeID, ApprovalAuthorityLevel) VALUES
(2,1),
(4,2);

INSERT INTO LeaveBalance (EmployeeID, TotalLeaves, UsedLeaves, Year, LastUpdated) VALUES
(1,20,2,2026,CURDATE()),
(2,20,4,2026,CURDATE()),
(3,20,1,2026,CURDATE()),
(4,20,3,2026,CURDATE()),
(5,20,2,2026,CURDATE()),
(6,20,0,2026,CURDATE());

INSERT INTO LeaveRequest (EmployeeID, StartDate, EndDate, Reason, RequestDate) VALUES
(1,'2026-04-10','2026-04-12','Vacation',CURDATE()),
(2,'2026-04-15','2026-04-16','Medical',CURDATE()),
(3,'2026-04-20','2026-04-22','Family Event',CURDATE()),
(4,'2026-05-01','2026-05-03','Travel',CURDATE());

INSERT INTO LeaveApproval (LeaveID, ApprovedBy, ApprovalStatus, ApprovalDate, Remarks) VALUES
(1,2,'Approved',CURDATE(),'Enjoy your vacation'),
(2,4,'Approved',CURDATE(),'Take rest'),
(3,2,'Pending',NULL,'Waiting for approval');

