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
  return apiFetch<Summary>("/api/insights/summary");
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const data = await apiFetch<any>("/api/insights/category-breakdown");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}

export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  const data = await apiFetch<any>("/api/insights/monthly-trends");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.trends)) return data.trends;
  return [];
}
