"use client";

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
      {/* Animated background elements */}
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-blob auth-blob-3"></div>
      <div className="auth-pixel auth-pixel-1"></div>
      <div className="auth-pixel auth-pixel-2"></div>
      <div className="auth-pixel auth-pixel-3"></div>
      <div className="auth-pixel auth-pixel-4"></div>

      <section className="auth-card">
        <div className="auth-header">
          <div>
            <h1 className="auth-title">OffGrid</h1>
            <p className="auth-subtitle">Leave Management Redefined</p>
          </div>
        </div>

        <p className="auth-description">Welcome back! 
          <br /> Manage your leave with ease.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <Input label="Email Address" type="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
          </div>

          <div className="form-group">
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
          </div>

          {errors.root?.message ? <p className="auth-error">{errors.root.message}</p> : null}

          <Button type="submit" disabled={isSubmitting} className="auth-btn">
            {isSubmitting ? "Signing in..." : "Enter OffGrid"}
          </Button>
        </form>

        <div className="auth-footer">
          <p>Need help? Contact your administrator</p>
        </div>
      </section>
    </main>
  );
}
