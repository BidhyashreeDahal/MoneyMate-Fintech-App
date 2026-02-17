"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      setSuccess(res.message || "Password reset successful.");
      setPassword("");
      setConfirm("");
      // Send user back to login after a moment
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/moneymate-logo.png"
            alt="MoneyMate logo"
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl"
            priority={false}
          />
          <h1 className="mt-4 text-2xl font-bold text-emerald-700">
            Set a new password
          </h1>
          <p className="text-sm text-gray-500">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              className="h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              className="h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update password"}
          </button>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-emerald-700 text-center">{success}</p>}

          <p className="text-xs text-gray-500 text-center">
            <a className="text-emerald-700 font-semibold hover:underline" href="/login">
              Back to sign in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

