"use client";

import { useEffect, useState } from "react";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  type Summary,
  type CategoryBreakdown,
  type MonthlyTrend,
} from "@/lib/insights";

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
  CartesianGrid,
} from "recharts";

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

// Safe currency formatter
function formatCurrency(value: any) {
  const safe =
    typeof value === "number" ? value : 0;

  return safe.toLocaleString(undefined, {
    style: "currency",
    currency: "CAD",
  });
}

export default function InsightsPage() {
  const [summary, setSummary] =
    useState<Summary | null>(null);
  const [categories, setCategories] =
    useState<CategoryBreakdown[]>([]);
  const [monthly, setMonthly] =
    useState<MonthlyTrend[]>([]);

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [
        summaryData,
        categoryData,
        monthlyData,
      ] = await Promise.all([
        getSummary(),
        getCategoryBreakdown(),
        getMonthlyTrends(),
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

      setCategories(categoryData ?? []);
      setMonthly(monthlyData ?? []);
    } catch (e: any) {
      setError(
        e?.message || "Failed to load insights"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-sm text-gray-500">
          Loading insights...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );

  return (
    <main className="max-w-6xl mx-auto space-y-10 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Insights </h1>

        <p className="text-gray-500 mt-2 text-sm">
          A visual overview of your income, expenses, and spending behavior.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            label="Total Income"
            value={summary.totalIncome}
            accent="green"
          />
          <SummaryCard
            label="Total Expense"
            value={summary.totalExpense}
            accent="red"
          />
          <SummaryCard
            label="Net Balance"
            value={summary.net}
            accent={
              summary.net >= 0
                ? "green"
                : "red"
            }
          />
        </div>
      )}

      {/* Monthly Trend */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Monthly Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track income versus expenses over time.
          </p>
        </div>

        {monthly.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-500">
            No trend data available.
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  formatter={formatCurrency}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Category Breakdown */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Spending by Category
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Distribution of your expenses.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-500">
            No expense data available.
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="category"
                  outerRadius={140}
                  innerRadius={80}
                >
                  {categories.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  formatter={formatCurrency}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "green" | "red";
}) {
  const accentStyles =
    accent === "green"
      ? "text-emerald-600"
      : "text-rose-600";

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-back-400">
        {label}
      </div>

      <div
        className={`text-xl font-semibold mt-2 ${accentStyles}`}
      >
        {formatCurrency(value)}
      </div>
    </div>
  );
}
