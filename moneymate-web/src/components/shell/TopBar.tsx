"use client";

/**
 * Topbar:
 * Bank-style header with user identity and logout.
 */

import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Topbar() {
  const { user, logout } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <header className="h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/15 flex items-center justify-center">
          <img src="/moneymate-logo.png" alt="MoneyMate logo" className="h-7 w-7" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">MoneyMate</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300">Secure Banking</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-emerald-200/70 dark:border-emerald-300/25 hover:bg-emerald-50 dark:hover:bg-white/5"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="border-emerald-200/70 dark:border-emerald-300/25 hover:bg-emerald-50 dark:hover:bg-white/5"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
