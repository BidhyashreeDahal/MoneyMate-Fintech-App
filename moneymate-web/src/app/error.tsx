"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-600 mb-6 max-w-md text-center">
        An unexpected error occurred. You can try again or go back to the home page.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go to home
        </Button>
      </div>
    </div>
  );
}
