

/**
 * Authentication functions for MoneyMate web application.
 * -------------------------------------------------------
 * Contains functions for login, signup, logout, and fetching
 * the current authenticated user's session.
 */
import { apiFetch } from "./api";
export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export async function getMe(): Promise<SessionUser> {
    const data = await apiFetch<{user: SessionUser}>("/api/auth/me");
    return data.user;
}
/**
 * Post /api/auth/login
 * logs in a user with email and password. 
 */
export async function login(email:string, password:string){
    return apiFetch<{message: string; user: SessionUser}>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({email, password}),
    });
}

/**
 * Post /api/auth/signup
 * Create a new user account.
 */
export async function signup(name: string, email: string, password: string) {
  return apiFetch<{message: string; user: SessionUser}>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Post /api/auth/logout
 * logs out the current user by clearing the cookie in the backend response.
 * */
export async function logout(){
    return apiFetch<{message: string}>("/api/auth/logout", {
        method: "POST",
    });
}

/**
 * POST /api/auth/forgot-password
 * Requests a password reset email (response is the same whether the email exists or not).
 */
export async function requestPasswordReset(email: string) {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /api/auth/reset-password
 * Resets password using a token from the reset link.
 */
export async function resetPassword(token: string, password: string) {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
