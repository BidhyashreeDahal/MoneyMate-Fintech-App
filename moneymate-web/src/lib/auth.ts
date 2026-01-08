

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
 * Post /api/auth/logout
 * logs out the current user by clearing the cookie in the backend response.
 * */
export async function logout(){
    return apiFetch<{message: string}>("/api/auth/logout", {
        method: "POST",
    });
}
