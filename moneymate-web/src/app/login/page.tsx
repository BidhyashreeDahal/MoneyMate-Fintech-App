"use client";

/**
 * Login Page
 * ------------------------------------------------------
 * Collect email/password
 * Call POST /api/auth/login
 * On success, redirect to dashboard
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/auth";
import { useSession } from "@/providers/SessionProvider";

export default function LoginPage() {
    const router = useRouter();
    const { user, loading, refresh } = useSession();

    // If already logged in (session loaded in background), go to dashboard
    useEffect(() => {
        if (!loading && user) router.replace("/dashboard");
    }, [loading, user, router]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto bg-white border border-emerald-100 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
              <img
                src="/moneymate-logo.png"
                alt="MoneyMate logo"
                className="h-9 w-9"
              />
            </div>
            <div>
              <div className="text-2xl font-bold">MoneyMate</div>
              <div className="text-sm text-emerald-50">Personal finance, simplified</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
            <div className="rounded-lg bg-white/10 px-3 py-2">Secure</div>
            <div className="rounded-lg bg-white/10 px-3 py-2">Insights</div>
            <div className="rounded-lg bg-white/10 px-3 py-2">Control</div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <a className="text-xs font-semibold text-emerald-700 hover:underline" href="/forgot-password">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  className="h-11 w-full rounded-md border border-gray-200 px-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-emerald-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="h-11 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-gray-500 text-center">
              Don&apos;t have an account?{" "}
              <a className="text-emerald-700 font-semibold hover:underline" href="/signup">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
 
