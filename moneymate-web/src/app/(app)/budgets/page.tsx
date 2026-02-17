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
import ConfirmDialog from "@/components/ui/confirm-dialog";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editBudget, setEditBudget] =
    useState<Budget | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] =
    useState<Budget | null>(null);
  const [archiving, setArchiving] = useState(false);

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

  const summary = useMemo(() => {
    const totalLimit = budgets.reduce(
      (sum, b) => sum + b.limitAmount,
      0
    );
    const totalSpent = budgets.reduce(
      (sum, b) => sum + b.spendAmount,
      0
    );
    const overCount = budgets.filter(
      (b) => b.isOverBudget
    ).length;
    return {
      totalLimit,
      totalSpent,
      totalRemaining: totalLimit - totalSpent,
      overCount,
      count: budgets.length,
    };
  }, [budgets]);

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs font-semibold text-emerald-700">
              Total Budgets
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              {summary.count}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="text-xs font-semibold text-emerald-700">
              Total Limit
            </div>
            <div className="text-xl font-semibold text-gray-900 mt-1">
              {summary.totalLimit.toLocaleString(undefined, {
                style: "currency",
                currency: "CAD",
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="text-xs font-semibold text-emerald-700">
              Spent
            </div>
            <div className="text-xl font-semibold text-gray-900 mt-1">
              {summary.totalSpent.toLocaleString(undefined, {
                style: "currency",
                currency: "CAD",
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="text-xs font-semibold text-emerald-700">
              Over Budget
            </div>
            <div className="text-xl font-semibold text-gray-900 mt-1">
              {summary.overCount}
            </div>
          </div>
        </div>
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
          <EmptyState
            title="No budgets created yet"
            description="Budgets help you set category limits and track spending progress."
            actionLabel="Create budget"
            onActionClick={() => setCreateOpen(true)}
          />
        )}

      {!loading &&
        !error &&
        sortedBudgets.length > 0 && (
          <div className="grid gap-4">
            {sortedBudgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onArchive={() => {
                  setArchiveTarget(budget);
                  setArchiveOpen(true);
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
        onCreated={async () => {
          await loadBudgets();
          toast({
            title: "Budget created",
            description: "Your budget has been saved.",
            variant: "success",
          });
        }}
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
      <ConfirmDialog
        open={archiveOpen}
        title="Archive budget?"
        description="Archive this budget? You can recreate it later if needed."
        confirmText="Archive"
        onConfirm={async () => {
          if (!archiveTarget) return;
          const target = archiveTarget;
          setArchiving(true);
          setArchiveOpen(false);
          setArchiveTarget(null);
          try {
            await deleteBudget(target._id);
            loadBudgets();
            toast({
              title: "Budget archived",
              description: `Archived budget for ${target.category}.`,
              variant: "success",
            });
          } catch (e: any) {
            setError(
              e?.message || "Failed to archive budget"
            );
          } finally {
            setArchiving(false);
          }
        }}
        onCancel={() => {
          if (archiving) return;
          setArchiveOpen(false);
          setArchiveTarget(null);
        }}
        loading={archiving}
      />
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
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
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
          <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Alert at {budget.alertThreshold}%
          </div>
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

      <div className="mt-4 w-full bg-emerald-100/60 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${barColor}`}
          style={{
            width: `${progressWidth}%`,
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mt-3 text-sm text-amber-600 font-medium">
            Approaching limit
          </div>
        )}
    </div>
  );
}
