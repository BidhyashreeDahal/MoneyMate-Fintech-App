"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App section error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50/80">
      <h2 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h2>
      <p className="text-red-800/90 mb-6 max-w-md text-center text-sm">
        This part of the app hit an error. Try again or go to another page.
      </p>
      <div className="flex gap-3">
        <Button variant="destructive" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
