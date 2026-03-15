"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";

export default function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => (await api.get("/dashboard/admin")).data.data,
  });

  const totals = data?.totals || {};

  return (
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
  );
}
