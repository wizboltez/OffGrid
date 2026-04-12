"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "features/auth/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Button } from "components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { resolveManagerDisplayName } from "lib/colorUtils";

const roleLinks = {
  EMPLOYEE: [
    { href: "/dashboard/employee", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/leave/apply", label: "Apply Leave" },
    { href: "/leave/my-requests", label: "My Requests" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
  MANAGER: [
    { href: "/dashboard/manager", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/leave/apply", label: "Apply Leave" },
    { href: "/leave/my-requests", label: "My Requests" },
    { href: "/leave/team-requests", label: "Team Requests" },
    { href: "/leave/team-history", label: "Team History" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/leave/apply", label: "Apply Leave" },
    { href: "/leave/my-requests", label: "My Requests" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
};

export function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, token, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  const links = useMemo(() => roleLinks[user?.role] || [], [user?.role]);
  const userDisplayName = resolveManagerDisplayName(user, user?.departmentId || user?.email || "user");

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "badge"],
    queryFn: async () => (await api.get("/notifications")).data.data,
    enabled: hydrated && Boolean(token),
  });

  const unreadCount = useMemo(
    () => (notificationsQuery.data || []).filter((item) => !item.isRead).length,
    [notificationsQuery.data]
  );

  const doLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!hydrated || !token) return <main className="auth-shell">Loading session...</main>;

  return (
    <div className="layout shell app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {mobileOpen ? <button className="mobile-overlay" type="button" onClick={() => setMobileOpen(false)} /> : null}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-dot" />
          <h2 style={{ fontFamily: "var(--font-space)" }}>OffGrid</h2>
        </div>
        <p className="sidebar-role">{userDisplayName}</p>

        <nav>
          {links.map((link) => (
            <Link
              className={`nav-link ${pathname.startsWith(link.href) ? "active" : ""}`}
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-link-inner">
                <span>{link.label}</span>
                {link.href === "/notifications" && unreadCount > 0 ? (
                  <span className="notif-count" title={`${unreadCount} notifications to see`}>
                    {unreadCount}
                  </span>
                ) : null}
              </span>
            </Link>
          ))}

          <Button className="ghost nav-logout" onClick={doLogout}>
            Logout
          </Button>
        </nav>
      </aside>

      <main className="content">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
          <Button className="ghost burger-btn" onClick={() => setMobileOpen((prev) => !prev)}>
            <span className="burger-lines" aria-hidden="true" />
            Menu
          </Button>
        </div>

        {children}
      </main>
    </div>
  );
}
