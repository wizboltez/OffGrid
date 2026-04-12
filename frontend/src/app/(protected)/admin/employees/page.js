"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";
import { Button } from "components/ui/Button";
import { Modal } from "components/ui/Modal";
import { Input } from "components/ui/Input";
import { getEmployeeColor } from "lib/colorUtils";

export default function EmployeeManagementPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    departmentId: "",
    managerId: "",
    isActive: true,
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data.data,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data.data,
  });

  const managersQuery = useQuery({
    queryKey: ["managers"],
    queryFn: async () => (await api.get("/users", { params: { role: "MANAGER", pageSize: 100 } })).data.data,
  });

  const users = usersQuery.data || [];
  const departments = departmentsQuery.data || [];
  const managers = useMemo(() => managersQuery.data || [], [managersQuery.data]);

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/users", payload)).data.data,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueryData(["users"]) || [];
      queryClient.setQueryData(["users"], [...previous, { id: `tmp-${Date.now()}`, ...payload, role: { name: payload.role } }]);
      return { previous };
    },
    onError: (_error, _payload, ctx) => {
      queryClient.setQueryData(["users"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/users/${id}`, payload)).data.data,
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueryData(["users"]) || [];
      queryClient.setQueryData(
        ["users"],
        previous.map((item) => (item.id === id ? { ...item, ...payload, role: payload.role ? { name: payload.role } : item.role } : item))
      );
      return { previous };
    },
    onError: (_error, _vars, ctx) => {
      queryClient.setQueryData(["users"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/users/${id}`)).data.data,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueryData(["users"]) || [];
      queryClient.setQueryData(
        ["users"],
        previous.map((item) => (item.id === id ? { ...item, isActive: false } : item))
      );
      return { previous };
    },
    onError: (_error, _id, ctx) => {
      queryClient.setQueryData(["users"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      departmentId: "",
      managerId: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      fullName: row.fullName || "",
      email: row.email || "",
      password: "",
      role: row.role?.name || "EMPLOYEE",
      departmentId: row.departmentId || "",
      managerId: row.managerId || "",
      isActive: !!row.isActive,
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      managerId: form.managerId ? Number(form.managerId) : null,
      isActive: form.isActive,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync({ ...payload, password: form.password || "ChangeMe@123" });
    }

    setModalOpen(false);
  };

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Employee Management</h1>
        <Button onClick={openCreate}>Add User</Button>
      </div>

      <DataTable
        columns={[
          {
            key: "fullName",
            label: "Name",
            render: (row) => {
              const colors = getEmployeeColor(row.id);
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
                  <span style={{ fontSize: "0.9rem" }}>{row.fullName}</span>
                </div>
              );
            },
          },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (row) => row.role?.name },
          { key: "isActive", label: "Active", render: (row) => (row.isActive ? "Yes" : "No") },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="row">
                <Button className="ghost" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button className="ghost" onClick={() => deactivateMutation.mutate(row.id)}>
                  Deactivate
                </Button>
              </div>
            ),
          },
        ]}
        rows={users}
      />

      <Modal title={editing ? "Edit User" : "Create User"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="grid" onSubmit={submit}>
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          {!editing ? (
            <Input
              label="Temporary password"
              type="text"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Default: ChangeMe@123"
            />
          ) : null}

          <div>
            <label className="label">Role</label>
            <select className="select" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="label">Department</label>
            <select
              className="select"
              value={form.departmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
            >
              <option value="">None</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reporting manager</label>
            <select className="select" value={form.managerId} onChange={(e) => setForm((prev) => ({ ...prev, managerId: e.target.value }))}>
              <option value="">None</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </select>
          </div>

          <label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />{" "}
            Active
          </label>

          <Button type="submit">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
