"use client";

import { forwardRef } from "react";

export const Input = forwardRef(function Input({ label, error, ...props }, ref) {
  return (
    <div>
      {label ? <label className="label">{label}</label> : null}
      <input ref={ref} className="field" {...props} />
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
});
