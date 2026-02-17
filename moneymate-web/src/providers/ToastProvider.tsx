"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function stylesFor(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "error":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-gray-200 bg-white text-gray-900";
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const ctx = useMemo<ToastContextValue>(() => {
    return {
      toast: (t) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const item: ToastItem = { id, ...t };
        setToasts((prev) => [item, ...prev].slice(0, 4));

        // auto-dismiss
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== id));
        }, 4500);
      },
    };
  }, []);

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast viewport */}
      <div className="fixed right-4 top-4 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border p-3 shadow-sm ${stylesFor(t.variant)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t.title}</div>
                {t.description && (
                  <div className="mt-1 text-sm opacity-80">{t.description}</div>
                )}
              </div>
              <button
                type="button"
                className="text-xs font-semibold opacity-70 hover:opacity-100"
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

