"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";

export default function ReportsPage() {
  const now = new Date();
  const { data } = useQuery({
    queryKey: ["reports", "monthly", now.getMonth() + 1, now.getFullYear()],
    queryFn: async () =>
      (
        await api.get("/reports/monthly", {
          params: {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        })
      ).data.data,
  });

  return (
    <div className="grid">
      <h1>Monthly Leave Report</h1>
      <p className="muted">Count: {data?.count || 0}</p>
      <DataTable
        columns={[
          { key: "employee", label: "Employee", render: (row) => row.employee?.fullName },
          { key: "leaveType", label: "Type", render: (row) => row.leaveType?.name },
          { key: "status", label: "Status" },
          { key: "appliedAt", label: "Applied", render: (row) => row.appliedAt.slice(0, 10) },
        ]}
        rows={data?.requests || []}
      />
    </div>
  );
}
