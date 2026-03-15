"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ token: null, user: null, hydrated: false });

  useEffect(() => {
    const raw = window.localStorage.getItem("lms-auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAuth({ ...parsed, hydrated: true });
      } catch {
        setAuth((prev) => ({ ...prev, hydrated: true }));
      }
    } else {
      setAuth((prev) => ({ ...prev, hydrated: true }));
    }
  }, []);

  const value = useMemo(
    () => ({
      ...auth,
      login: (payload) => {
        window.localStorage.setItem("lms-auth", JSON.stringify(payload));
        setAuth({ ...payload, hydrated: true });
      },
      logout: () => {
        window.localStorage.removeItem("lms-auth");
        setAuth({ token: null, user: null, hydrated: true });
      },
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
