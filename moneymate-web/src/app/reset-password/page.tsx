import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 text-sm text-gray-500">
            Loading...
          </div>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

