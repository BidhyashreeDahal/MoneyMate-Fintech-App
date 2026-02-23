"use client";

import { useState } from "react";
import { updateBudget, type Budget } from "@/lib/budgets";
import { TRANSACTION_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";

type Props = {budget: Budget;onClose: () => void;onUpdated: () => void;
};

export default function EditBudgetModal({
  budget,
  onClose,
  onUpdated,
}: Props) {
  const [category, setCategory] = useState(budget.category);
  const [limitAmount, setLimitAmount] = useState(String(budget.limitAmount));
  const [startDate, setStartDate] = useState(budget.startDate.slice(0, 10));
  const [endDate, setEndDate] = useState(budget.endDate.slice(0, 10));
  const [alertThreshold, setAlertThreshold] = useState(String(budget.alertThreshold));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!category ||!limitAmount || !startDate ||!endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      await updateBudget(budget._id, {
        category,
        limitAmount: Number(limitAmount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        alertThreshold: Number(alertThreshold),
      });

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(
        e?.message ||
    "Failed to update budget."
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
            Edit Budget
          </h2>
          <p className="text-sm text-emerald-50 mt-1">
            Update category, limit, or time period.
          </p>
        </div>
        <div className="p-6 space-y-6">

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

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
              {category && !TRANSACTION_CATEGORIES.includes(category as (typeof TRANSACTION_CATEGORIES)[number]) && (
                <option value={category}>{category} (pick same as transactions)</option>
              )}
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
                setLimitAmount(
                  e.target.value
                )
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  setStartDate(
                    e.target.value
                  )
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
                  setEndDate(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Alert */}
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
              min={0}
              max={100}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={Number(alertThreshold) || 0}
              onChange={(e) =>
                setAlertThreshold(
                  e.target.value
                )
              }
              className="w-full accent-emerald-600"
            />
            <p className="text-xs text-gray-500">
              Notification will trigger when this percentage is reached.
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
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
