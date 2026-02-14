"use client";

import { useState } from "react";
import {
  updateBudget,
  type Budget,
} from "@/lib/budgets";
import { Button } from "@/components/ui/button";

type Props = {
  budget: Budget;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditBudgetModal({
  budget,
  onClose,
  onUpdated,
}: Props) {
  const [limitAmount, setLimitAmount] =
    useState(String(budget.limitAmount));
  const [alertThreshold, setAlertThreshold] =
    useState(String(budget.alertThreshold));

  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      await updateBudget(
        budget._id,
        {
          limitAmount:
            Number(limitAmount),
          alertThreshold:
            Number(alertThreshold),
        }
      );

      onUpdated();
    } catch (e: any) {
      setError(
        e?.message ||
          "Failed to update budget"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Edit Budget
        </h2>

        {error && (
          <p className="text-red-600 mb-3">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <input
            type="number"
            value={limitAmount}
            onChange={(e) =>
              setLimitAmount(
                e.target.value
              )
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="number"
            value={alertThreshold}
            onChange={(e) =>
              setAlertThreshold(
                e.target.value
              )
            }
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex justify-end gap-2 pt-2">
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
                ? "Updating..."
                : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
