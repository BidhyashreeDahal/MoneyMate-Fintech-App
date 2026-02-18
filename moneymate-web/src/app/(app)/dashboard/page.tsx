"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/SessionProvider";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  type CategoryBreakdown,
  type MonthlyTrend,
} from "@/lib/insights";
import { listAccounts } from "@/lib/accounts";
import { listTransactions, type Transaction } from "@/lib/transactions";
import { listBudgets, type Budget } from "@/lib/budgets";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Account = {
  _id: string;
  name: string;
  balance: number;
  currency: string;
};

const COLORS = [
  "#10B981",
  "#34D399",
  "#22C55E",
  "#60A5FA",
  "#A78BFA",
  "#F59E0B",
  "#F97316",
  "#EF4444",
];

export default function DashboardPage() {
  const { user } = useSession();

  const [summary, setSummary] = useState<{
    totalIncome: number;
    totalExpense: number;
    net: number;
  } | null>(null);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [budgets, setBudgets] =
    useState<Budget[]>([]);

  const [monthly, setMonthly] =
    useState<MonthlyTrend[]>([]);

  const [categories, setCategories] =
    useState<CategoryBreakdown[]>([]);

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setError(null);
      try {
        const [
          summaryData,
          accountsData,
          transactionsData,
          budgetsData,
          monthlyData,
          categoriesData,
        ] = await Promise.all([
          getSummary(),
          listAccounts(),
          listTransactions(),
          listBudgets(),
          getMonthlyTrends(),
          getCategoryBreakdown(),
        ]);

        setSummary({
          totalIncome:
            summaryData?.totalIncome ?? 0,
          totalExpense:
            summaryData?.totalExpense ?? 0,
          net:
            summaryData?.net ??
            (summaryData?.totalIncome ?? 0) -
              (summaryData?.totalExpense ?? 0),
        });

        setAccounts(accountsData ?? []);
        setTransactions(transactionsData ?? []);
        setBudgets(budgetsData ?? []);
        setMonthly(monthlyData ?? []);
        setCategories(categoriesData ?? []);
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance ?? 0),
    0
  );

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 6);
  }, [transactions]);

  const topBudgets = useMemo(() => {
    return [...budgets]
      .sort((a, b) => b.percentUsed - a.percentUsed)
      .slice(0, 4);
  }, [budgets]);

  function formatCurrency(value: number) {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency: "CAD",
    });
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6">
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <img
                src="/moneymate-logo.png"
                alt="MoneyMate logo"
                className="h-8 w-8"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Welcome back
                {user?.name ? `, ${user.name}` : ""}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/transactions">Add Transaction</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/transfers">New Transfer</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/budgets">Create Budget</Link>
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Top KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Balance"
          value={formatCurrency(totalBalance)}
          accent="neutral"
          subtitle="Across all accounts"
        />

        <KpiCard
          label="This Month Income"
          value={formatCurrency(
            summary?.totalIncome ?? 0
          )}
          accent="green"
          subtitle="Income only"
        />

        <KpiCard
          label="This Month Expense"
          value={formatCurrency(
            summary?.totalExpense ?? 0
          )}
          accent="red"
          subtitle="Expenses only"
        />

        <KpiCard
          label="Net Position"
          value={formatCurrency(summary?.net ?? 0)}
          accent={(summary?.net ?? 0) >= 0 ? "green" : "red"}
          subtitle="Income minus expenses"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Cashflow Trend
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              Income vs Expense
            </span>
          </div>
          {monthly.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-gray-500">
              No data yet. Add transactions to see trends.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Spending Breakdown
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              Categories
            </span>
          </div>
          {categories.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-gray-500">
              No expenses yet. Add expenses to see categories.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    outerRadius={110}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Budgets + Accounts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Budget Status
            </h2>
            <Link
              href="/budgets"
              className="text-xs text-emerald-700 hover:underline"
            >
              View all
            </Link>
          </div>
          {topBudgets.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              description="Create a budget to track category limits and avoid overspending."
              actionLabel="Create budget"
              actionHref="/budgets"
            />
          ) : (
            <div className="space-y-4">
              {topBudgets.map((budget) => {
                const barColor = budget.isOverBudget
                  ? "bg-red-500"
                  : budget.alertTriggered
                  ? "bg-amber-500"
                  : "bg-emerald-500";
                return (
                  <div key={budget._id}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-gray-900">
                        {budget.category}
                      </div>
                      <div className="text-xs text-gray-500">
                        {budget.percentUsed}% used
                      </div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-emerald-100/60">
                      <div
                        className={`h-2 rounded-full ${barColor}`}
                        style={{
                          width: `${Math.min(
                            budget.percentUsed,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Accounts Overview
            </h2>
            <span className="text-xs text-gray-500">
              {accounts.length} accounts
            </span>
          </div>
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts yet"
              description="Create an account to start tracking balances and transactions."
              actionLabel="Create account"
              actionHref="/accounts"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {accounts.slice(0, 4).map((account) => (
                <div
                  key={account._id}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"
                >
                  <div className="text-xs text-gray-500">
                    {account.name}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(account.balance)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Accounts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Recent Transactions
          </h2>
          <Link
            href="/transactions"
            className="text-xs text-emerald-700 hover:underline"
          >
            View all
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-gray-500">
            No transactions yet. Add your first one.
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-b">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Notes</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
            {recentTransactions.map((t) => {
              const isExpense = t.type === "expense";
              return (
                <div
                  key={t._id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center"
                >
                  <div className="col-span-2 text-sm text-gray-500">
                    {new Date(t.date).toLocaleDateString()}
                  </div>
                  <div className="col-span-4 text-sm text-gray-900 truncate">
                    {t.notes?.trim() || "—"}
                  </div>
                  <div className="col-span-3 text-sm text-gray-600">
                    {t.category}
                  </div>
                  <div className="col-span-3 text-right text-sm font-semibold">
                    <span className={isExpense ? "text-red-600" : "text-emerald-600"}>
                      {isExpense ? "-" : "+"}
                      {t.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: t.currency || "CAD",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* User Info */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6">
        <div className="text-sm font-medium">
          Signed in as
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {user?.email}
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: string;
  subtitle: string;
  accent: "green" | "red" | "neutral";
}) {
  const accentStyles =
    accent === "green"
      ? "text-green-600"
      : accent === "red"
      ? "text-red-600"
      : "text-gray-900";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition">
      <div className="text-sm text-gray-500">
        {label}
      </div>
      <div
        className={`text-xl sm:text-2xl font-semibold mt-3 tracking-tight ${accentStyles}`}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {subtitle}
      </div>
    </div>
  );
}
