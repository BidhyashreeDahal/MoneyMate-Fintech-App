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
import { getMonthlyAiReport, type MonthlyAiReportResponse } from "@/lib/reports";
import { Button } from "@/components/ui/button";

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

  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [aiReport, setAiReport] =
    useState<MonthlyAiReportResponse | null>(null);
  const [reportLoading, setReportLoading] =
    useState(false);
  const [reportError, setReportError] =
    useState<string | null>(null);

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

  async function generateReport() {
    setReportError(null);
    setReportLoading(true);
    try {
      const data = await getMonthlyAiReport(reportMonth);
      setAiReport(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to generate report";
      setReportError(message);
    } finally {
      setReportLoading(false);
    }
  }

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-gray-500">
          Loading insights...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
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

      {/* AI Monthly Report */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">AI Monthly Financial Report</h2>
            <p className="text-sm text-gray-500 mt-1">
              Generate an AI summary and recommendations for a selected month.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="grid gap-1">
              <label className="text-xs font-medium text-gray-600">Month</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="h-10 rounded-md border border-gray-200 px-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={generateReport}
              disabled={reportLoading}
              className="h-10 mt-5 sm:mt-0 rounded-md bg-emerald-600 text-white text-sm font-semibold px-4 hover:bg-emerald-700 disabled:opacity-60"
            >
              {reportLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {reportError && (
          <p className="mt-4 text-sm text-red-600">{reportError}</p>
        )}

        {aiReport && (
          <div className="mt-6 grid gap-4">
            {!aiReport.aiEnabled && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                {aiReport.reportMarkdown}
              </p>
            )}

            {aiReport.aiEnabled && aiReport.reportMarkdown && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Report
                </div>
                <div className="whitespace-pre-wrap text-sm text-gray-900">
                  {aiReport.reportMarkdown}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

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
