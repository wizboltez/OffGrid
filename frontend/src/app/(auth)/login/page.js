"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "lib/apiClient";
import { useAuth } from "features/auth/AuthContext";
import { Input } from "components/ui/Input";
import { Button } from "components/ui/Button";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    try {
      const response = await api.post("/auth/login", values);
      login(response.data.data);

      const role = response.data.data.user.role;
      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "MANAGER") router.push("/dashboard/manager");
      else router.push("/dashboard/employee");
    } catch (error) {
      setError("root", { message: error?.response?.data?.message || "Login failed" });
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 style={{ fontFamily: "var(--font-space)", marginTop: 0 }}>Sign in</h1>
        <p className="muted">Access your leave workspace securely.</p>

        <form className="grid" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" placeholder="********" error={errors.password?.message} {...register("password")} />

          {errors.root?.message ? <p className="error">{errors.root.message}</p> : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="muted" style={{ marginTop: "1rem" }}>
          New here? <Link href="/register" style={{ color: "var(--brand)" }}>Create account</Link>
        </p>
      </section>
    </main>
  );
}
