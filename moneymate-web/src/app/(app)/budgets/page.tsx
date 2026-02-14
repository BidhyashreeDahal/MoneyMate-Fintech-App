"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listBudgets,
  deleteBudget,
  type Budget,
} from "@/lib/budgets";
import { Button } from "@/components/ui/button";
import CreateBudgetModal from "@/components/budgets/createBudgetModal";
import EditBudgetModal from "@/components/budgets/EditBudgetModal";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editBudget, setEditBudget] =
    useState<Budget | null>(null);

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

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort(
      (a, b) => b.percentUsed - a.percentUsed
    );
  }, [budgets]);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold">
            Budgets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track spending by category and control financial limits.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
        >
          + Create Budget
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading budgets...
        </p>
      )}

      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        sortedBudgets.length === 0 && (
          <p className="text-sm text-gray-500">
            No budgets created yet.
          </p>
        )}

      {!loading &&
        !error &&
        sortedBudgets.length > 0 && (
          <div className="grid gap-4">
            {sortedBudgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onArchive={async () => {
                  await deleteBudget(
                    budget._id
                  );
                  loadBudgets();
                }}
                onEdit={() =>
                  setEditBudget(budget)
                }
              />
            ))}
          </div>
        )}

      <CreateBudgetModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadBudgets}
      />

      {editBudget && (
        <EditBudgetModal
          budget={editBudget}
          onClose={() =>
            setEditBudget(null)
          }
          onUpdated={() => {
            setEditBudget(null);
            loadBudgets();
          }}
        />
      )}
    </main>
  );
}
function BudgetCard({
  budget,
  onArchive,
  onEdit,
}: {
  budget: Budget;
  onArchive: () => void;
  onEdit: () => void;
}) {
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
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">
            {budget.category}
          </h2>

          <p className="text-xs text-gray-500 mt-1">
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
          <div className="text-sm font-medium">
            {budget.spendAmount.toLocaleString(
              undefined,
              {
                style: "currency",
                currency: "CAD",
              }
            )}{" "}
            /{" "}
            {budget.limitAmount.toLocaleString(
              undefined,
              {
                style: "currency",
                currency: "CAD",
              }
            )}
          </div>

          <div className="text-xs text-gray-500">
            {budget.percentUsed}% used
          </div>
        </div>
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${barColor}`}
          style={{
            width: `${progressWidth}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Remaining:{" "}
          {budget.remaining.toLocaleString(
            undefined,
            {
              style: "currency",
              currency: "CAD",
            }
          )}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onArchive}
          >
            Archive
          </Button>
        </div>
      </div>

      {budget.isOverBudget && (
        <div className="mt-3 text-sm text-red-600 font-medium">
          Over budget
        </div>
      )}

      {!budget.isOverBudget &&
        budget.alertTriggered && (
          <div className="mt-3 text-sm text-yellow-600 font-medium">
            Approaching limit
          </div>
        )}
    </div>
  );
}
