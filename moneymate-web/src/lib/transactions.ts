/**
 * Transactions service layer
 * Handles API class for transactions
 */

import { apiFetch, getApiBaseOrThrow, parseApiError } from "./api";
export type Transaction = {
    _id: string;
    userId: string;
    accountId: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    currency?: string;
    category: string;
    notes?: string;
    date: string; // ISO date string
    archived: boolean;
    receiptUrl?: string;
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

export async function uploadReceipt(id: string, file: File): Promise<Transaction> {
    const formData = new FormData();
    formData.append("receipt", file);

    const base = getApiBaseOrThrow();
    const res = await fetch(`${base}/api/transactions/${id}/receipt`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!res.ok) {
        throw await parseApiError(res, "Upload failed");
    }

    const data = await res.json();
    return data.transaction ?? data;
}