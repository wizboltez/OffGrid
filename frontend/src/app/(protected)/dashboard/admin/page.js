"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => (await api.get("/dashboard/admin")).data.data,
  });

  const totals = data?.totals || {};

  return (
    <div className="grid">
      <Card>
        <div className="section-head">
          <div>
            <h2 style={{ margin: "0 0 0.2rem" }}>Admin Control Deck</h2>
            <p className="muted" style={{ margin: 0 }}>
              Monitor organization leave flow and keep staffing plans balanced.
            </p>
          </div>
          <div className="dashboard-quick">
            <Link className="btn" href="/calendar">
              Org Calendar
            </Link>
            <Link className="btn ghost" href="/leave/team-requests">
              All Requests
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid cards">
        <Card title="Employees">
          <h2>{totals.totalEmployees || 0}</h2>
        </Card>
        <Card title="Pending requests">
          <h2>{totals.pendingRequests || 0}</h2>
        </Card>
        <Card title="Approved requests">
          <h2>{totals.approvedRequests || 0}</h2>
        </Card>
        <Card title="Rejected requests">
          <h2>{totals.rejectedRequests || 0}</h2>
        </Card>
      </div>
    </div>
  );
}
