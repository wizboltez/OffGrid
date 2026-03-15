"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "lib/apiClient";
import { Button } from "components/ui/Button";
import { Input } from "components/ui/Input";

export default function ApplyLeavePage() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      isHalfDay: false,
      emergencyFlag: false,
    },
  });

  const leaveTypesQuery = useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => (await api.get("/leave-types")).data.data,
  });

  const onSubmit = async (values) => {
    await api.post("/leave-requests", {
      ...values,
      leaveTypeId: Number(values.leaveTypeId),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    });
    reset();
    alert("Leave request submitted");
  };

  return (
    <section className="card" style={{ maxWidth: 700 }}>
      <h1 style={{ marginTop: 0 }}>Apply for Leave</h1>
      <form className="grid" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Leave Type</label>
          <select className="select" {...register("leaveTypeId", { required: true })}>
            <option value="">Select</option>
            {(leaveTypesQuery.data || []).map((leaveType) => (
              <option key={leaveType.id} value={leaveType.id}>
                {leaveType.name}
              </option>
            ))}
          </select>
        </div>

        <Input label="Start date" type="date" {...register("startDate", { required: true })} />
        <Input label="End date" type="date" {...register("endDate", { required: true })} />

        <div>
          <label className="label">Reason</label>
          <textarea className="textarea" {...register("reason", { required: true })} />
        </div>

        <label>
          <input type="checkbox" {...register("isHalfDay")} /> Half day
        </label>
        <label>
          <input type="checkbox" {...register("emergencyFlag")} /> Emergency flag
        </label>

        <Button type="submit">Submit request</Button>
      </form>
    </section>
  );
}
