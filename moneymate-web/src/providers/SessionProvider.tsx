"use client";

/**
 * SessionProvider
 * ------------------------------------------------------
 * Bank-style session management:
 * - On first load, call GET /api/auth/me to restore session
 * - Store user in React state (client-side session)
 * - Provide user + loading state to any component
 *
 * Why:
 * - Cookies persist across refresh, but React state does NOT
 * - /me is the "source of truth" for whether you are logged in
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as apiLogout, SessionUser } from "@/lib/auth";

type SessionContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: (userFromLogin?: SessionUser | null) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh(userFromLogin?: SessionUser | null) {
    if (userFromLogin !== undefined) {
      setUser(userFromLogin);
      setLoading(false);
      return;
    }
    const timeoutMs = 15_000; // 15s max wait so we never hang on "Redirecting..."
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Session check timeout")), timeoutMs)
    );
    try {
      const me = await Promise.race([getMe(), timeoutPromise]);
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
