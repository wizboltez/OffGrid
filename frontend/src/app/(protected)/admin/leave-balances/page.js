"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";

export default function LeaveBalancesPage() {
  const { data } = useQuery({
    queryKey: ["leave-balances"],
    queryFn: async () => (await api.get("/leave-balances/me")).data.data,
  });

  return (
    <DataTable
      columns={[
        { key: "leaveType", label: "Leave Type", render: (row) => row.leaveType?.name },
        { key: "year", label: "Year" },
        { key: "allocated", label: "Allocated" },
        { key: "used", label: "Used" },
        { key: "remaining", label: "Remaining" },
      ]}
      rows={data || []}
    />
  );
}
