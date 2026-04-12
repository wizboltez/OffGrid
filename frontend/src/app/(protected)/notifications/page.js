"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data.data,
  });

  useEffect(() => {
    api.patch("/notifications/mark-as-read").then(() => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
  }, [queryClient]);

  return (
    <div className="grid">
      {(data || []).length === 0 ? (
        <Card title="Notifications">
          <p className="muted">No notifications available.</p>
        </Card>
      ) : (
        (data || []).map((item) => (
          <Card key={item.id} title={item.title}>
            <p>{item.message}</p>
            <p className="muted">{item.createdAt.slice(0, 19).replace("T", " ")}</p>
          </Card>
        ))
      )}
    </div>
  );
}
