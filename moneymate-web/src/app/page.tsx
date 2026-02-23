"use client";

/**
 * Root route: send user to login immediately so the UI shows fast.
 * Session check runs in background; login page redirects to dashboard if already logged in.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div style={{ padding: 24, fontSize: 14, color: "#666" }}>
      Loading...
    </div>
  );
}
