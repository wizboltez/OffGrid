USE leave_management_system;

-- 1. View all employees
SELECT * FROM Employee;

-- 2. Employees working remotely
SELECT Name
FROM Employee
WHERE WorkMode = 'Remote';

-- 3. Employees with priority level >= 3
SELECT *
FROM Employee
WHERE PriorityLevel >= 3;

-- 4. Employee with Department
SELECT E.Name, D.DeptName
FROM Employee E
JOIN Team T ON E.TeamID = T.TeamID
JOIN Department D ON T.DeptID = D.DeptID;

-- 5. Employee Leave Requests
SELECT E.Name, LR.StartDate, LR.EndDate, LR.Reason
FROM Employee E
JOIN LeaveRequest LR
ON E.EmployeeID = LR.EmployeeID;

-- 6. Leave Approval with Manager
SELECT LR.LeaveID, LA.ApprovalStatus, E.Name AS ApprovedBy
FROM LeaveApproval LA
JOIN Employee E ON LA.ApprovedBy = E.EmployeeID
JOIN LeaveRequest LR ON LR.LeaveID = LA.LeaveID;

-- 7. Logical operator example
SELECT *
FROM Employee
WHERE WorkMode='Remote'
AND PriorityLevel >= 2;

-- 8. BETWEEN operator
SELECT *
FROM LeaveRequest
WHERE StartDate BETWEEN '2026-04-01' AND '2026-04-30';

-- 9. IN operator
SELECT *
FROM Employee
WHERE TeamID IN (1,2);

-- 10. COUNT function
SELECT COUNT(*) AS TotalEmployees
FROM Employee;

-- 11. SUM function
SELECT SUM(UsedLeaves) AS TotalLeavesUsed
FROM LeaveBalance;

-- 12. AVG function
SELECT AVG(PriorityLevel) AS AvgPriority
FROM Employee;

-- 13. MAX function
SELECT MAX(UsedLeaves) AS MaxLeavesTaken
FROM LeaveBalance;

-- 14. Calculate number of leave days
SELECT LeaveID,
DATEDIFF(EndDate,StartDate)+1 AS NumberOfDays
FROM LeaveRequest;

-- 15. Update leave approval
UPDATE LeaveApproval
SET ApprovalStatus='Rejected'
WHERE ApprovalID=3;

-- 16. Update employee work mode
UPDATE Employee
SET WorkMode='Hybrid'
WHERE EmployeeID=3;

-- 17. Update leave balance
UPDATE LeaveBalance
SET UsedLeaves = UsedLeaves + 2
WHERE EmployeeID = 1;

-- Delete dependent records first
DELETE FROM LeaveBalance
WHERE EmployeeID = 6;

DELETE FROM LeaveRequest
WHERE EmployeeID = 6;

DELETE FROM TeamLead
WHERE EmployeeID = 6;

-- Now delete the employee
DELETE FROM Employee
WHERE EmployeeID = 6;

-- 20. Remaining leaves calculation
SELECT EmployeeID,
TotalLeaves - UsedLeaves AS RemainingLeaves
FROM LeaveBalance;

-- 21. Employees currently on leave
SELECT E.Name, LR.StartDate, LR.EndDate
FROM Employee E
JOIN LeaveRequest LR
ON E.EmployeeID = LR.EmployeeID
WHERE CURDATE() BETWEEN LR.StartDate AND LR.EndDate;