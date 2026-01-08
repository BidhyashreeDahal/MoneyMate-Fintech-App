"use client";

/**
 * Temporary test page to verify auth.ts works.
 * We'll delete this page after SessionProvider is built.
 *
 * Why this page exists:
 * - It tests cookie auth end-to-end from browser → backend
 * - Without UI complexity (no forms yet)
 */

import { useState } from "react";
import { getMe, login, logout } from "@/lib/auth";

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null);

  async function handleLogin() {
    try {
      // Replace these with your real test user credentials
      const data = await login("bidhya.test@gmail.com", "Test12345!");
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    }
  }

  async function handleMe() {
    try {
      const user = await getMe();
      setResult(user);
    } catch (e: any) {
      setResult({ error: e.message });
    }
  }

  async function handleLogout() {
    try {
      const data = await logout();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Auth Test Page</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleMe}>GET /me</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <pre style={{ marginTop: 16 }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
