"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "lib/dateFormat";
import { DataTable } from "components/ui/DataTable";
import { StatusBadge } from "components/ui/StatusBadge";
import { Button } from "components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";

export default function MyLeaveRequestsPage() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ["leave-requests", "me"],
    queryFn: async () => (await api.get("/leave-requests", { params: { scope: "mine" } })).data.data,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => api.patch(`/leave-requests/${id}/cancel`, { remark: "Cancelled by employee" }),
    onSuccess: async () => {
      await requestsQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["leave-requests", "calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "employee"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "manager"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/leave-requests/${id}`),
    onSuccess: async () => {
      await requestsQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["leave-requests", "calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "employee"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "manager"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/leave-requests/${id}`, payload),
    onSuccess: async () => {
      await requestsQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["leave-requests", "calendar"] });
    },
  });

  const handleEdit = (row) => {
    const startDate = window.prompt("Start date (YYYY-MM-DD)", row.startDate.slice(0, 10));
    if (!startDate) return;
    const endDate = window.prompt("End date (YYYY-MM-DD)", row.endDate.slice(0, 10));
    if (!endDate) return;
    const reason = window.prompt("Reason", row.reason || "") || row.reason || "Leave request updated";

    updateMutation.mutate({
      id: row.id,
      payload: {
        leaveTypeId: row.leaveTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason,
        isHalfDay: Boolean(row.isHalfDay),
        emergencyFlag: Boolean(row.emergencyFlag),
      },
    });
  };

  return (
    <DataTable
      columns={[
        { key: "leaveType", label: "Leave Type", render: (row) => row.leaveType?.name },
        { key: "startDate", label: "Start", render: (row) => formatDateDDMMYYYY(row.startDate) },
        { key: "endDate", label: "End", render: (row) => formatDateDDMMYYYY(row.endDate) },
        { key: "appliedAt", label: "Applied At", render: (row) => formatDateTimeDDMMYYYY(row.appliedAt) },
        { key: "totalDays", label: "Days" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
        {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {row.status === "PENDING" ? (
                <>
                  <Button className="ghost" onClick={() => handleEdit(row)}>
                    Edit
                  </Button>
                  <Button className="ghost" onClick={() => cancelMutation.mutate(row.id)}>
                    Cancel
                  </Button>
                  <Button className="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                    Delete
                  </Button>
                </>
              ) : row.status === "APPROVED" ? (
                <>
                  <Button className="ghost" onClick={() => cancelMutation.mutate(row.id)}>
                    Cancel
                  </Button>
                  <Button className="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                    Delete
                  </Button>
                </>
              ) : (
                <Button className="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                  Delete
                </Button>
              )}
            </div>
          ),
        },
      ]}
      rows={requestsQuery.data || []}
    />
  );
}
