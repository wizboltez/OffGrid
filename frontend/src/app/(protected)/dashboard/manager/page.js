"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";
import { StatusBadge } from "components/ui/StatusBadge";

export default function ManagerDashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard", "manager"],
    queryFn: async () => (await api.get("/dashboard/manager")).data.data,
  });

  const pending = data?.pendingApprovals || [];
  const onLeave = data?.teamOnLeaveToday || [];

  return (
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
    </div>
  );
}
