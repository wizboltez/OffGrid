"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { formatDateDDMMYYYY } from "lib/dateFormat";
import { Card } from "components/ui/Card";
import { StatusBadge } from "components/ui/StatusBadge";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard", "employee"],
    queryFn: async () => (await api.get("/dashboard/employee")).data.data,
  });

  const balances = data?.balances || [];
  const recent = data?.recentRequests || [];

  return (
    <div className="grid">
      <Card>
        <div className="section-head">
          <div>
            <h2 style={{ margin: "0 0 0.2rem" }}>Your Leave Space</h2>
            <p className="muted" style={{ margin: 0 }}>
              Follow requests and check your leave timeline in one place.
            </p>
          </div>
          <div className="dashboard-quick">
            <Link className="btn" href="/calendar">
              Open Calendar
            </Link>
            <Link className="btn ghost" href="/leave/apply">
              Apply Leave
            </Link>
          </div>
        </div>
      </Card>

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
                {request.leaveType.name} | {formatDateDDMMYYYY(request.startDate)} to {formatDateDDMMYYYY(request.endDate)}
              </span>
              <StatusBadge status={request.status} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
