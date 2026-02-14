"use client";

import { useState } from "react";
import { createBudget } from "@/lib/budgets";
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
      setError("All fields are required");
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
    } catch (e: any) {
      setError(e?.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Create Budget
        </h2>

        {error && (
          <p className="text-red-600 mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="number"
            placeholder="Limit Amount"
            value={limitAmount}
            onChange={(e) =>
              setLimitAmount(e.target.value)
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="number"
            placeholder="Alert Threshold (%)"
            value={alertThreshold}
            onChange={(e) =>
              setAlertThreshold(e.target.value)
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

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
