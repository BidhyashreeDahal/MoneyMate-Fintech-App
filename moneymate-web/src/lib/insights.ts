/**
 * Insights API helpers
 */
import { apiFetch } from "./api";

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  net: number;
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
};

export type MonthlyTrend = {
  month: string;
  income: number;
  expense: number;
};

export async function getSummary(): Promise<Summary> {
  const data = await apiFetch<any>("/api/insights/summary");
  if (data?.totals) {
    return {
      totalIncome: data.totals.income ?? 0,
      totalExpense: data.totals.expense ?? 0,
      net: data.totals.netBalance ?? 0,
    };
  }
  return {
    totalIncome: data?.totalIncome ?? 0,
    totalExpense: data?.totalExpense ?? 0,
    net: data?.net ?? 0,
  };
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const data = await apiFetch<any>("/api/insights/category-breakdown");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) {
    return data.categories.map((item: any) => ({
      category: item.category ?? item._id ?? "Uncategorized",
      amount: item.amount ?? item.total ?? 0,
    }));
  }
  return [];
}

export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  const data = await apiFetch<any>("/api/insights/monthly-trends");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.trends)) return data.trends;
  if (Array.isArray(data?.monthlyTrends)) return data.monthlyTrends;
  return [];
}
