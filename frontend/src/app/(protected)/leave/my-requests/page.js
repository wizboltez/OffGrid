"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";
import { StatusBadge } from "components/ui/StatusBadge";

export default function MyLeaveRequestsPage() {
  const { data } = useQuery({
    queryKey: ["leave-requests", "me"],
    queryFn: async () => (await api.get("/leave-requests")).data.data,
  });

  return (
    <DataTable
      columns={[
        { key: "leaveType", label: "Leave Type", render: (row) => row.leaveType?.name },
        { key: "startDate", label: "Start", render: (row) => row.startDate.slice(0, 10) },
        { key: "endDate", label: "End", render: (row) => row.endDate.slice(0, 10) },
        { key: "totalDays", label: "Days" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      rows={data || []}
    />
  );
}
