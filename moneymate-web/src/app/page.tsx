"use client";

/**
 * Root route
 * - If logged in => /dashboard
 * - Else => /login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return <p style={{ padding: 24 }}>Redirecting...</p>;
}
