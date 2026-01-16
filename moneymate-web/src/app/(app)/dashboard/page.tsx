"use client";

/**
 * Dashboard page
 * ------------------------------------------------------
 * Protected by (app)/layout.tsx already.
 * Simple UI with plain divs (no shadcn Card needed).
 */

import { useSession } from "@/providers/SessionProvider";

export default function DashboardPage() {
  const { user } = useSession();

  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="opacity-75 mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}.
        </p>
      </div>

      {/* “Cards” using divs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium opacity-70">Total balance</div>
          <div className="text-2xl font-bold mt-2">$0.00</div>
          <div className="text-xs opacity-70 mt-1">Across all accounts</div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium opacity-70">This month spending</div>
          <div className="text-2xl font-bold mt-2">$0.00</div>
          <div className="text-xs opacity-70 mt-1">Expenses only</div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium opacity-70">This month income</div>
          <div className="text-2xl font-bold mt-2">$0.00</div>
          <div className="text-xs opacity-70 mt-1">Income only</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-semibold">Signed in as</div>
        <div className="text-sm opacity-75 mt-1">{user?.email}</div>
      </div>
    </main>
  );
}
