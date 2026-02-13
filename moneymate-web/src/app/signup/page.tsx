"use client";

/**
 * Signup Page
 * ------------------------------------------------------
 * Create a new user account
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/SessionProvider";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      await apiLogin(email, password);
      await refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Create account</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          {submitting ? "Creating..." : "Sign up"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <p style={{ fontSize: 13, opacity: 0.75 }}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </main>
  );
}
