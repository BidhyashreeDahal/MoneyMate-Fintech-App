import { apiFetch } from "./api";

export type MonthlyAiReportStats = {
  month: string;
  range: { start: string; endExclusive: string };
  totalsByCurrency: Record<
    string,
    { income: number; expense: number; transfer: number; count: number }
  >;
  topExpenseCategories: Array<{ category: string; total: number }>;
  topExpenseMerchants: Array<{ merchant: string; total: number; count: number }>;
  budgets: Array<{
    category: string;
    limitAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentUsed: number;
    isOverBudget: boolean;
    alertThreshold: number;
    alertTriggered: boolean;
  }>;
};

export type MonthlyAiReportResponse = {
  aiEnabled: boolean;
  stats: MonthlyAiReportStats;
  reportMarkdown: string;
};

export async function getMonthlyAiReport(month?: string): Promise<MonthlyAiReportResponse> {
  const q = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiFetch<MonthlyAiReportResponse>(`/api/reports/monthly-ai${q}`);
}

