/**
 * Transactions service layer
 * Handles API class for transactions
 */

import { apiFetch } from "./api";
export type Transaction = {
    _id: string;
    userId: string;
    accountId: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    category: string;
    notes?: string;
    date: string; // ISO date string
    archived: boolean;
    createdAt?: string;};

export type CreateTransactionInput = {
    accountId: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    notes?: string;
    date: string; // ISO date string
};

export async function listTransactions(): Promise<Transaction[]> {
    const data = await apiFetch<any>("/api/transactions");

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.transactions)) return data.transactions;
    return [];
}

export async function createTransaction(
    input: CreateTransactionInput
): Promise<Transaction> {
    const data = await apiFetch<any>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(input),
    });
    return data.transaction ?? data;
}

export async function updateTransaction(
    id: string,
    input: Partial<CreateTransactionInput>
): Promise<Transaction> {
    const data = await apiFetch<any>(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
    return data.transaction ?? data;
}

export async function archiveTransaction(id: string): Promise<void> {
    await apiFetch(`/api/transactions/${id}`, {
        method: "DELETE",
    });
}