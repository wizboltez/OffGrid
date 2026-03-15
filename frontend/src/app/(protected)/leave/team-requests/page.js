"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";
import { StatusBadge } from "components/ui/StatusBadge";
import { Button } from "components/ui/Button";

export default function TeamLeaveRequestsPage() {
  const requestsQuery = useQuery({
    queryKey: ["leave-requests", "team"],
    queryFn: async () => (await api.get("/leave-requests")).data.data,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }) => api.patch(`/leave-requests/${id}/${action}`, { remark: `${action} via manager panel` }),
    onSuccess: () => requestsQuery.refetch(),
  });

  return (
    <DataTable
      columns={[
        { key: "employee", label: "Employee", render: (row) => row.employee?.fullName },
        { key: "leaveType", label: "Type", render: (row) => row.leaveType?.name },
        { key: "startDate", label: "Start", render: (row) => row.startDate.slice(0, 10) },
        { key: "endDate", label: "End", render: (row) => row.endDate.slice(0, 10) },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
        {
          key: "actions",
          label: "Actions",
          render: (row) =>
            row.status === "PENDING" ? (
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <Button onClick={() => actionMutation.mutate({ id: row.id, action: "approve" })}>Approve</Button>
                <Button className="ghost" onClick={() => actionMutation.mutate({ id: row.id, action: "reject" })}>
                  Reject
                </Button>
              </div>
            ) : (
              "-"
            ),
        },
      ]}
      rows={requestsQuery.data || []}
    />
  );
}
