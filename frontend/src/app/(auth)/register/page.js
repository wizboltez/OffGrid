"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "lib/apiClient";
import { Input } from "components/ui/Input";
import { Button } from "components/ui/Button";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    try {
      await api.post("/auth/register", { ...values, role: "EMPLOYEE" });
      reset();
      alert("Registration successful. Please login.");
    } catch (error) {
      setError("root", { message: error?.response?.data?.message || "Registration failed" });
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 style={{ fontFamily: "var(--font-space)", marginTop: 0 }}>Create account</h1>

        <form className="grid" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full name" placeholder="Your full name" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" placeholder="Minimum 8 characters" error={errors.password?.message} {...register("password")} />
          {errors.root?.message ? <p className="error">{errors.root.message}</p> : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="muted" style={{ marginTop: "1rem" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--brand)" }}>Sign in</Link>
        </p>
      </section>
    </main>
  );
}
