"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";

export default function ProfilePage() {
  const { data } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => (await api.get("/users/me")).data.data,
  });

  return (
    <Card title="My Profile">
      <p>Name: {data?.fullName}</p>
      <p>Email: {data?.email}</p>
      <p>Role: {data?.role?.name}</p>
      <p>Department: {data?.department?.name || "Not assigned"}</p>
      <p>Manager: {data?.manager?.fullName || "Not assigned"}</p>
    </Card>
  );
}
