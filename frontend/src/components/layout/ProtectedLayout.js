"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "features/auth/AuthContext";
import { useEffect, useMemo } from "react";
import { Button } from "components/ui/Button";

const roleLinks = {
  EMPLOYEE: [
    { href: "/dashboard/employee", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/leave/apply", label: "Apply Leave" },
    { href: "/leave/my-requests", label: "My Requests" },
    { href: "/profile", label: "Profile" },
    { href: "/notifications", label: "Notifications" },
  ],
  MANAGER: [
    { href: "/dashboard/manager", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/leave/team-requests", label: "Team Requests" },
    { href: "/reports", label: "Reports" },
    { href: "/notifications", label: "Notifications" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
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
  const roleLabel = user?.role === "MANAGER" ? "Team Leader" : user?.role || "Member";

  if (!hydrated || !token) return <main className="auth-shell">Loading session...</main>;

  return (
    <div className="layout shell app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-dot" />
          <h2 style={{ fontFamily: "var(--font-space)" }}>LeaveOps</h2>
        </div>
        <p className="sidebar-role">{roleLabel}</p>

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
          <div className="user-chip">
            <div className="avatar-circle">{(user?.fullName || "U").charAt(0)}</div>
            <div>
              <strong>{user?.fullName}</strong>
              <p className="muted" style={{ margin: "0.2rem 0 0" }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="topbar-actions">
            <Button className="ghost">Quick Filter</Button>
            <p className="muted" style={{ margin: "0.2rem 0 0" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
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
