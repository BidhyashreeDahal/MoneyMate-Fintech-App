"use client";

import { useState } from "react";
import { createBudget } from "@/lib/budgets";
import { TRANSACTION_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateBudgetModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!category || !limitAmount || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      await createBudget({
        category,
        limitAmount: Number(limitAmount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        alertThreshold: Number(alertThreshold),
      });

      onCreated();
      onClose();

      // Reset fields after close
      setCategory("");
      setLimitAmount("");
      setStartDate("");
      setEndDate("");
      setAlertThreshold("80");
    } catch (e: any) {
      setError(
        e?.message || "Failed to create budget."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white">
          <h2 className="text-xl font-semibold">
            Create Budget
          </h2>
          <p className="text-sm text-emerald-50 mt-1">
            Set a limit and time window to stay on track.
          </p>
        </div>
        <div className="p-6 space-y-6">

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Category — must match transaction categories exactly for spending to count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="">Select category</option>
              {TRANSACTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Monthly Limit
            </label>
            <input
              type="number"
              value={limitAmount}
              onChange={(e) =>
                setLimitAmount(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="500"
              min={0}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Alert Threshold (%)
            </label>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) =>
                setAlertThreshold(
                  e.target.value
                )
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="80"
              min={0}
              max={100}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={Number(alertThreshold) || 0}
              onChange={(e) =>
                setAlertThreshold(e.target.value)
              }
              className="w-full accent-emerald-600"
            />
            <p className="text-xs text-gray-500">
              You will be notified when spending reaches this percentage.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Budget"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
