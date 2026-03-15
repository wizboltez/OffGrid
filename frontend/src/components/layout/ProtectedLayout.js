"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "features/auth/AuthContext";
import { useEffect, useMemo } from "react";
import { Button } from "components/ui/Button";

const roleLinks = {
  EMPLOYEE: [
    { href: "/dashboard/employee", label: "Dashboard" },
    { href: "/leave/apply", label: "Apply Leave" },
    { href: "/leave/my-requests", label: "My Requests" },
    { href: "/profile", label: "Profile" },
    { href: "/notifications", label: "Notifications" },
  ],
  MANAGER: [
    { href: "/dashboard/manager", label: "Dashboard" },
    { href: "/leave/team-requests", label: "Team Requests" },
    { href: "/reports", label: "Reports" },
    { href: "/notifications", label: "Notifications" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/admin/employees", label: "Employees" },
    { href: "/admin/departments", label: "Departments" },
    { href: "/admin/leave-types", label: "Leave Types" },
    { href: "/admin/leave-balances", label: "Leave Balances" },
    { href: "/leave/team-requests", label: "All Requests" },
    { href: "/reports", label: "Reports" },
    { href: "/notifications", label: "Notifications" },
  ],
};

export function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, token, user, logout } = useAuth();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  const links = useMemo(() => roleLinks[user?.role] || [], [user?.role]);

  if (!hydrated || !token) return <main className="auth-shell">Loading session...</main>;

  return (
    <div className="layout shell">
      <aside className="sidebar">
        <h2 style={{ fontFamily: "var(--font-space)" }}>LeaveOps</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>{user?.role}</p>
        <nav>
          {links.map((link) => (
            <Link
              className={`nav-link ${pathname.startsWith(link.href) ? "active" : ""}`}
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <strong>{user?.fullName}</strong>
            <p className="muted" style={{ margin: "0.2rem 0 0" }}>
              {user?.email}
            </p>
          </div>
          <Button
            className="ghost"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Logout
          </Button>
        </header>

        {children}
      </main>
    </div>
  );
}
