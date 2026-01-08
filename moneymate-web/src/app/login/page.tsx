"use client";

/**
 * Login Page
 * ------------------------------------------------------
 * Collect email/password
 * Call POST /api/auth/login
 * On success, redirect to dashboard
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/auth";
import { useSession } from "@/providers/SessionProvider";

export default function LoginPage() {
    const router = useRouter();
    const { refresh } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError
        setSubmitting(true);
        try {
            await apiLogin(email, password);
            await refresh();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    }
    return (
    <main style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>MoneyMate Login</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={submitting} type="submit">
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </main>
  );
}
 
