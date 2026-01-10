"use client";

/**
 * Topbar:
 * Bank-style header with user identity and logout.
 */

import { useSession } from "@/providers/SessionProvider";

export default function Topbar() {
  const { user, logout } = useSession();

  return (
    <header
      style={{
        height: 64,
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div style={{ fontWeight: 600 }}>Secure Banking</div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 14 }}>{user?.email}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
