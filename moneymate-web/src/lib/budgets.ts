/**
 * Budgets API helpers
 */
import { apiFetch } from "./api";

export type Budget = {
  _id: string;
  userId: string;
  category: string;
  limitAmount: number;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  archived: boolean;
};

export type BudgetWithStats = {
  budget: Budget;
  spendAmount: number;
  remaining: number;
  percentUsed: number;
  alertTriggered: boolean;
};

export type CreateBudgetInput = {
  category: string;
  limitAmount: number;
  startDate: string;
  endDate: string;
  alertThreshold?: number;
};

export type UpdateBudgetInput = Partial<CreateBudgetInput>;

export async function listBudgets(): Promise<BudgetWithStats[]> {
  const data = await apiFetch<any>("/api/budgets");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.budgets)) return data.budgets;
  return [];
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const data = await apiFetch<any>("/api/budgets", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.budget ?? data;
}

export async function updateBudget(budgetId: string, input: UpdateBudgetInput): Promise<Budget> {
  const data = await apiFetch<any>(`/api/budgets/${budgetId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.budget ?? data;
}

export async function deleteBudget(budgetId: string): Promise<void> {
  await apiFetch<any>(`/api/budgets/${budgetId}`, {
    method: "DELETE",
  });
}
