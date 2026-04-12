"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";
import { StatusBadge } from "components/ui/StatusBadge";
import Link from "next/link";
import { useAuth } from "features/auth/AuthContext";
import { resolveManagerDisplayName } from "lib/colorUtils";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["dashboard", "manager"],
    queryFn: async () => (await api.get("/dashboard/manager")).data.data,
  });

  const managerName = resolveManagerDisplayName(user, user?.departmentId || user?.email || "manager");

  const pending = data?.pendingApprovals || [];
  const onLeave = data?.teamOnLeaveToday || [];
  const applications = data?.leaveApplications || [];

  return (
    <div className="grid">
      <Card>
        <div className="section-head">
          <div>
            <p className="muted" style={{ margin: "0 0 0.35rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {managerName}
            </p>
            <h2 style={{ margin: "0 0 0.2rem" }}>Team Leader Overview</h2>
            <p className="muted" style={{ margin: 0 }}>
              Keep approvals and team availability synced with calendar context.
            </p>
          </div>
          <div className="dashboard-quick">
            <Link className="btn" href="/calendar">
              Team Calendar
            </Link>
            <Link className="btn ghost" href="/leave/team-requests">
              Review Requests
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid cards">
      <Card title="Pending approvals">
        <h2>{pending.length}</h2>
      </Card>
      <Card title="Team on leave today">
        <h2>{onLeave.length}</h2>
      </Card>

      <Card title="Pending list">
        {pending.slice(0, 6).map((request) => (
          <p key={request.id}>
            {request.employee.fullName} - {request.leaveType.name} <StatusBadge status={request.status} />
          </p>
        ))}
      </Card>

      <Card title="Leave applications">
        {(applications || []).slice(0, 6).map((request) => (
          <p key={request.id}>
            {request.employee.fullName} - {request.leaveType.name} ({new Date(request.appliedAt).toLocaleString()}){" "}
            <StatusBadge status={request.status} />
          </p>
        ))}
      </Card>
      </div>
    </div>
  );
}
