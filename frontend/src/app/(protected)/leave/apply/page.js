"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "lib/apiClient";
import { Button } from "components/ui/Button";
import { Input } from "components/ui/Input";

export default function ApplyLeavePage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const reasonValue = watch("reason", "");
  const reasonLimit = 500;

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
      isHalfDay: false,
      emergencyFlag: false,
    });
    reset();
    alert("Leave request submitted");
  };

  return (
    <section className="card" style={{ width: "min(100%, 700px)", margin: 0, justifySelf: "start" }}>
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

        <div className="reason-field-wrap">
          <label className="label">Reason</label>
          <textarea
            className="textarea reason-textarea"
            maxLength={reasonLimit}
            {...register("reason", {
              required: "Reason is required",
              maxLength: {
                value: reasonLimit,
                message: `Reason must be at most ${reasonLimit} characters`,
              },
            })}
          />
          <div className="field-help-row">
            <span className="muted">Be specific and professional.</span>
            <span className={`muted ${reasonValue.length >= reasonLimit ? "text-danger" : ""}`}>
              {reasonValue.length}/{reasonLimit}
            </span>
          </div>
          {errors.reason?.message ? <p className="error">{errors.reason.message}</p> : null}
        </div>

        <Button type="submit">Submit request</Button>
      </form>
    </section>
  );
}
