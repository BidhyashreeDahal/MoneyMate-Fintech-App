/**
 * Transfers API helpers
 */
import { apiFetch } from "./api";

export type Transfer = {
  _id: string;
  fromAccountId: { _id: string; name: string; currency: string } | string;
  toAccountId: { _id: string; name: string; currency: string } | string;
  amount: number;
  currency: string;
  note?: string;
  status: "pending" | "completed" | "failed";
  date: string;
};

export type CreateTransferInput = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string;
  date?: string;
};

export async function listTransfers(): Promise<Transfer[]> {
  const data = await apiFetch<any>("/api/transfers");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.transfers)) return data.transfers;
  return [];
}

export async function createTransfer(input: CreateTransferInput): Promise<Transfer> {
  const data = await apiFetch<any>("/api/transfers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.transfer ?? data;
}
