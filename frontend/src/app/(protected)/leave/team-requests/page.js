"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "lib/dateFormat";
import { DataTable } from "components/ui/DataTable";
import { StatusBadge } from "components/ui/StatusBadge";
import { Button } from "components/ui/Button";
import { useState } from "react";
import { getEmployeeColor } from "lib/colorUtils";

export default function TeamLeaveRequestsPage() {
  const queryClient = useQueryClient();
  const [rejectionModal, setRejectionModal] = useState({ open: false, leaveId: null, reason: "" });

  const requestsQuery = useQuery({
    queryKey: ["leave-requests", "team"],
    queryFn: async () => (await api.get("/leave-requests")).data.data,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, remark }) => api.patch(`/leave-requests/${id}/${action}`, { remark }),
    onSuccess: async () => {
      await requestsQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["leave-requests", "calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "manager"] });
      setRejectionModal({ open: false, leaveId: null, reason: "" });
    },
    onError: (error) => {
      window.alert(error?.response?.data?.message || "Unable to process leave request");
    },
  });

  const pendingRows = (requestsQuery.data || []).filter((req) => req.status === "PENDING");

  const handleRejectClick = (leaveId) => {
    setRejectionModal({ open: true, leaveId, reason: "" });
  };

  const handleRejectSubmit = () => {
    if (!rejectionModal.reason.trim()) {
      window.alert("Please provide a rejection reason");
      return;
    }
    actionMutation.mutate({ id: rejectionModal.leaveId, action: "reject", remark: rejectionModal.reason });
  };

  return (
    <>
      <DataTable
        columns={[
          {
            key: "employee",
            label: "Employee",
            render: (row) => {
              const colors = getEmployeeColor(row.employee?.id);
              return (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    backgroundColor: colors.bg,
                    color: colors.text,
                    padding: "0.4rem 0.8rem",
                    borderRadius: "8px",
                    borderLeft: `3px solid ${colors.border}`,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{row.employee?.fullName}</span>
                </div>
              );
            },
          },
          { key: "leaveType", label: "Type", render: (row) => row.leaveType?.name },
          { key: "startDate", label: "Start", render: (row) => formatDateDDMMYYYY(row.startDate) },
          { key: "endDate", label: "End", render: (row) => formatDateDDMMYYYY(row.endDate) },
          { key: "appliedAt", label: "Applied At", render: (row) => formatDateTimeDDMMYYYY(row.appliedAt) },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <Button onClick={() => actionMutation.mutate({ id: row.id, action: "approve", remark: "Approved by manager" })}>Approve</Button>
                <Button className="ghost" onClick={() => handleRejectClick(row.id)}>
                  Reject
                </Button>
              </div>
            ),
          },
        ]}
        rows={pendingRows}
      />

    {rejectionModal.open && (
      <div className="modal-overlay" onClick={() => setRejectionModal({ open: false, leaveId: null, reason: "" })}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Reject Leave Request</h3>
          <p>Please provide a reason for rejecting this leave request:</p>
          
          <textarea
            className="modal-textarea"
            value={rejectionModal.reason}
            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
            placeholder="e.g., Exceeded leave balance, Business requirement, Coverage not available..."
            rows="5"
          />

          <div className="modal-actions">
            <Button
              className="ghost"
              onClick={() => setRejectionModal({ open: false, leaveId: null, reason: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={!rejectionModal.reason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
