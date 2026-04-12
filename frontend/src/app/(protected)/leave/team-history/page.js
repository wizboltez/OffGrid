"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "lib/dateFormat";
import { DataTable } from "components/ui/DataTable";
import { StatusBadge } from "components/ui/StatusBadge";
import { getEmployeeColor } from "lib/colorUtils";

export default function TeamLeaveHistoryPage() {
  const historyQuery = useQuery({
    queryKey: ["leave-requests", "team-history"],
    queryFn: async () => (await api.get("/leave-requests", { params: { pageSize: 100 } })).data.data,
  });

  const rows = (historyQuery.data || []).filter((row) => row.status !== "PENDING");

  return (
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
      ]}
      rows={rows}
    />
  );
}
