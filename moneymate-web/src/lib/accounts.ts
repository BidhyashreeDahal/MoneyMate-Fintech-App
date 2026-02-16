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


export type UpdateAccountInput = {
  name?: string;
  type?: "checking" | "savings" | "cash" | "credit_card" | "investment" | "wallet";
  currency?: string;
  goalAmount?: number | null;
  color?: string;
  icon?: string | null;
};

export async function updateAccount(accountId: string, input: UpdateAccountInput): Promise<Account> {
  const data = await apiFetch<any>(`/api/accounts/${accountId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });

  // backend returns { message, account }
  return data.account ?? data;
}

// Archive account
export async function archiveAccount(accountId: string): Promise<void> {
  await apiFetch(`/api/accounts/${accountId}`, {
    method: "DELETE",
  });
}
