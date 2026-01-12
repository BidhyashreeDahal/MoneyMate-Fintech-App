/**
 * Small service layer for account-related API calls
 */

import { apiFetch } from "./api";
export type Account = {
    _id: string,
    name:string;
    type: string;
    currency: string;
    balance: number;
    color?: string;
    icon?: string;
    goalAmount?: number | null;
    archived: boolean;
}

export type CreateAccountInput = {
    name: string;
    type: "checking" |"savings" | "cash" | "credit_card" | "investment" | "wallet";
    currency?: string;
    balance?: number;
    color?: string;
    icon?: string;
    goalAmount?: number;
}

export async function listAccounts(): Promise<Account[]> {
  const data = await apiFetch<any>("/api/accounts");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.accounts)) return data.accounts;

  return [];
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
    console.log("CREATE ACCOUNT INPUT (lib/accounts.ts):", input);
  const data = await apiFetch<any>("/api/accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });

  // backend might return { account: {...} } or {...}
  return data.account ?? data;
}
