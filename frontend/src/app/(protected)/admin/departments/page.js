"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "lib/apiClient";
import { DataTable } from "components/ui/DataTable";
import { Button } from "components/ui/Button";
import { Modal } from "components/ui/Modal";
import { Input } from "components/ui/Input";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/departments", payload)).data.data,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["departments"] });
      const previous = queryClient.getQueryData(["departments"]) || [];
      queryClient.setQueryData(["departments"], [...previous, { id: `tmp-${Date.now()}`, ...payload }]);
      return { previous };
    },
    onError: (_error, _payload, ctx) => {
      queryClient.setQueryData(["departments"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/departments/${id}`, payload)).data.data,
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["departments"] });
      const previous = queryClient.getQueryData(["departments"]) || [];
      queryClient.setQueryData(
        ["departments"],
        previous.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );
      return { previous };
    },
    onError: (_error, _vars, ctx) => {
      queryClient.setQueryData(["departments"], ctx?.previous || []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/departments/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["departments"] });
      const previous = queryClient.getQueryData(["departments"]) || [];
      queryClient.setQueryData(
        ["departments"],
        previous.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (_error, _id, ctx) => {
      queryClient.setQueryData(["departments"], ctx?.previous || []);
      alert("Delete failed. Ensure no users are assigned to this department.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || "", description: row.description || "" });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setModalOpen(false);
  };

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Department Management</h1>
        <Button onClick={openCreate}>Add Department</Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Department" },
          { key: "description", label: "Description" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="row">
                <Button className="ghost" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button className="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        rows={data || []}
      />

      <Modal title={editing ? "Edit Department" : "Create Department"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="grid" onSubmit={submit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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
          <Button type="submit">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
