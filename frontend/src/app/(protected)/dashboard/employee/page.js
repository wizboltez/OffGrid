"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";
import { StatusBadge } from "components/ui/StatusBadge";

export default function EmployeeDashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard", "employee"],
    queryFn: async () => (await api.get("/dashboard/employee")).data.data,
  });

  const balances = data?.balances || [];
  const recent = data?.recentRequests || [];

  return (
    <div className="grid">
      <div className="grid cards">
        {balances.slice(0, 4).map((balance) => (
          <Card key={balance.id} title={balance.leaveType.name}>
            <p>Remaining: {Number(balance.remaining).toFixed(1)}</p>
            <p className="muted">Used: {Number(balance.used).toFixed(1)}</p>
          </Card>
        ))}
      </div>

      <Card title="Recent leave requests">
        {recent.length === 0 ? (
          <p className="muted">No leave requests yet.</p>
        ) : (
          recent.map((request) => (
            <div key={request.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.7rem" }}>
              <span>
                {request.leaveType.name} | {request.startDate.slice(0, 10)} to {request.endDate.slice(0, 10)}
              </span>
              <StatusBadge status={request.status} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
