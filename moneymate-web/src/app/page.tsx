"use client";

/**
 * Root route
 * - If logged in => /dashboard
 * - Else => /login
 * Shows fallback link if session check takes too long (backend slow/unreachable).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";

const SLOW_THRESHOLD_MS = 5000; // Show "taking long?" after 5s

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setSlow(true), SLOW_THRESHOLD_MS);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div style={{ padding: 24 }}>
      <p>Redirecting...</p>
      {slow && (
        <p style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
          Taking longer than usual?{" "}
          <Link href="/login" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Continue to login
          </Link>
        </p>
      )}
    </div>
  );
}
