"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";
import { Button } from "components/ui/Button";
import { Modal } from "components/ui/Modal";
import { Input } from "components/ui/Input";

export default function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    defaultAllowance: 0,
    requiresDocument: false,
    carryForwardAllowed: false,
    isActive: true,
  });

  const { data } = useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => (await api.get("/leave-types")).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/leave-types", payload)).data.data,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["leave-types"] });
      const previous = queryClient.getQueryData(["leave-types"]) || [];
      queryClient.setQueryData(["leave-types"], [...previous, { id: `tmp-${Date.now()}`, ...payload }]);
      return { previous };
    },
    onError: (_error, _payload, ctx) => {
      queryClient.setQueryData(["leave-types"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["leave-types"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/leave-types/${id}`, payload)).data.data,
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["leave-types"] });
      const previous = queryClient.getQueryData(["leave-types"]) || [];
      queryClient.setQueryData(
        ["leave-types"],
        previous.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );
      return { previous };
    },
    onError: (_error, _vars, ctx) => {
      queryClient.setQueryData(["leave-types"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["leave-types"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/leave-types/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["leave-types"] });
      const previous = queryClient.getQueryData(["leave-types"]) || [];
      queryClient.setQueryData(
        ["leave-types"],
        previous.map((item) => (item.id === id ? { ...item, isActive: false } : item))
      );
      return { previous };
    },
    onError: (_error, _id, ctx) => {
      queryClient.setQueryData(["leave-types"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["leave-types"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      defaultAllowance: 0,
      requiresDocument: false,
      carryForwardAllowed: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      description: row.description || "",
      defaultAllowance: Number(row.defaultAllowance || 0),
      requiresDocument: !!row.requiresDocument,
      carryForwardAllowed: !!row.carryForwardAllowed,
      isActive: !!row.isActive,
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      defaultAllowance: Number(form.defaultAllowance),
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Leave Type Management</h1>
        <Button onClick={openCreate}>Add Leave Type</Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Leave Type" },
          { key: "defaultAllowance", label: "Default Allowance" },
          { key: "requiresDocument", label: "Document Required", render: (row) => (row.requiresDocument ? "Yes" : "No") },
          { key: "carryForwardAllowed", label: "Carry Forward", render: (row) => (row.carryForwardAllowed ? "Yes" : "No") },
          { key: "isActive", label: "Active", render: (row) => (row.isActive ? "Yes" : "No") },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="row">
                <Button className="ghost" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button className="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                  Deactivate
                </Button>
              </div>
            ),
          },
        ]}
        rows={data || []}
      />

      <Modal title={editing ? "Edit Leave Type" : "Create Leave Type"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="grid" onSubmit={submit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Default allowance"
            type="number"
            min="0"
            step="0.5"
            value={form.defaultAllowance}
            onChange={(e) => setForm((prev) => ({ ...prev, defaultAllowance: e.target.value }))}
            required
          />
          <div>
            <label className="label">Description</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <label>
            <input
              type="checkbox"
              checked={form.requiresDocument}
              onChange={(e) => setForm((prev) => ({ ...prev, requiresDocument: e.target.checked }))}
            />{" "}
            Document required
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.carryForwardAllowed}
              onChange={(e) => setForm((prev) => ({ ...prev, carryForwardAllowed: e.target.checked }))}
            />{" "}
            Carry forward allowed
          </label>
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
