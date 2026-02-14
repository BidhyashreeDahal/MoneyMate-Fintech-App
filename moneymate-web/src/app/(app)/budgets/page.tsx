"use client";

import { useEffect, useMemo, useState } from "react";
import { listBudgets, type Budget } from "@/lib/budgets";
import { Button } from "@/components/ui/button";
import CreateBudgetModal from "@/components/budgets/createBudgetModal";
import EditBudgetModal from "@/components/budgets/EditBudgetModal";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBudgets() {
    setLoading(true);
    setError(null);

    try {
      const data = await listBudgets();
      setBudgets(data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, []);

  // Sort budgets by highest percent used (most urgent first)
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort(
      (a, b) => b.percentUsed - a.percentUsed
    );
  }, [budgets]);

  return (
    <main>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="opacity-70 mt-1">
            Monitor spending by category.
          </p>
        </div>

        <Button>Create Budget</Button>
      </div>

      {loading && (
        <p className="mt-4">Loading budgets...</p>
      )}

      {error && !loading && (
        <p className="mt-4 text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && sortedBudgets.length === 0 && (
        <p className="mt-4 opacity-70">
          No budgets created yet.
        </p>
      )}

      {!loading && !error && sortedBudgets.length > 0 && (
        <div className="mt-6 space-y-4">
          {sortedBudgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
            />
          ))}
        </div>
      )}
    </main>
  );
}
function BudgetCard({ budget }: { budget: Budget }) {
  const progressWidth = Math.min(
    budget.percentUsed,
    100
  );

  const barColor = budget.isOverBudget
    ? "bg-red-500"
    : budget.alertTriggered
    ? "bg-yellow-500"
    : "bg-blue-500";

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">
            {budget.category}
          </h2>

          <p className="text-sm opacity-70">
            {new Date(
              budget.startDate
            ).toLocaleDateString()}{" "}
            –{" "}
            {new Date(
              budget.endDate
            ).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <div className="font-semibold">
            {budget.spendAmount.toLocaleString(
              undefined,
              {
                style: "currency",
                currency: "CAD",
              }
            )}
            {" / "}
            {budget.limitAmount.toLocaleString(
              undefined,
              {
                style: "currency",
                currency: "CAD",
              }
            )}
          </div>

          <div className="text-sm opacity-70">
            {budget.percentUsed}% used
          </div>
        </div>
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded h-2">
        <div
          className={`h-2 rounded ${barColor}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-sm">
        <span>
          Remaining:{" "}
          {budget.remaining.toLocaleString(
            undefined,
            {
              style: "currency",
              currency: "CAD",
            }
          )}
        </span>

        {budget.isOverBudget && (
          <span className="text-red-600 font-medium">
            Over budget
          </span>
        )}

        {!budget.isOverBudget &&
          budget.alertTriggered && (
            <span className="text-yellow-600 font-medium">
              Approaching limit
            </span>
          )}
      </div>
    </div>
  );
}

