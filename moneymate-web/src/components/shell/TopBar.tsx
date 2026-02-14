"use client";

/**
 * Topbar:
 * Bank-style header with user identity and logout.
 */

import { useSession } from "@/providers/SessionProvider";
export default function Topbar() {
  const { user, logout } = useSession();

  return (
    <header className="h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-600/10 flex items-center justify-center">
          <img src="/moneymate-logo.png" alt="MoneyMate logo" className="h-7 w-7" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">MoneyMate</div>
          <div className="text-xs text-emerald-700">Secure Banking</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button
          onClick={logout}
          className="rounded-md border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
