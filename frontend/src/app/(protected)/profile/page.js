"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";
import { getEmployeeColor, resolveManagerDisplayName } from "lib/colorUtils";

export default function ProfilePage() {
  const { data } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => (await api.get("/users/me")).data.data,
  });

  const userColor = useMemo(() => getEmployeeColor(data?.id), [data?.id]);
  const managerName = useMemo(() => {
    if (!data) return null;
    return resolveManagerDisplayName(data?.manager, data?.department?.name || data?.email);
  }, [data]);

  const employeeName = data ? resolveManagerDisplayName(data, data?.email || "employee") : "Employee";
  const employeeEmail = data?.email || "-";
  const employeeRole = data?.role?.name || "-";
  const employeeDepartment = data?.department?.name || "Not assigned";

  return (
    <Card>
      <div className="profile-container">
        <div className="profile-head">
          <h2 className="profile-title">My Profile</h2>
          <p className="profile-subtitle">A clear snapshot of your account and reporting line.</p>
        </div>

        <div className="profile-grid-layout">
          <section className="profile-panel">
            <div
              className="profile-identity"
              style={{
                backgroundColor: userColor.bg,
                borderColor: userColor.border,
              }}
            >
              <div className="profile-avatar" style={{ backgroundColor: userColor.avatar }}>
                {employeeName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="profile-label">Employee</p>
                <p className="profile-value" style={{ color: userColor.text }}>
                  {employeeName}
                </p>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{employeeEmail}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role</span>
                <span className="info-value">{employeeRole}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Department</span>
                <span className="info-value">{employeeDepartment}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Manager</span>
                <span className="info-value">{managerName || "Not assigned"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
}
