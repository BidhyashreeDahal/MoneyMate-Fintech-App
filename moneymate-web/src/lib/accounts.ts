/**
 * Small service layer for account-related API calls
 */

import { apiFetch } from "./api";
export  type Account = {
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
    type: "checking" |" saving" | "cash" | "credit_card" | "investment" | "wallet";
    currency?: string;
    balance?: number;
    color?: string;
    icon?: string;
    goalAmount?: number;
}

export async function listAccounts(): Promise<Account[]>{
    return apiFetch<Account[]>("/api/accounts");
}

export async function createAccount(input: CreateAccountInput): Promise<Account>{
    return apiFetch<Account>("/api/accounts",{
        method:"POST",
        body: JSON.stringify(input),
    });
}
