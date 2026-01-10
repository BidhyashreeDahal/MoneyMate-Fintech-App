"use client";

/**
 * Dashboard page (protected)
 * ------------------------------------------------------
 * If user is not logged in, redirect to /login.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useSession();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <p>Loading session...</p>;
  if (!user) return null; // redirecting

  return (
    <main style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name} ({user.email})</p>

      <button onClick={logout}>Logout</button>
    </main>
  );
}
