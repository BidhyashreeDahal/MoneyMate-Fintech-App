/**
 * api.ts
 * -------------------------------------------------------
 * Helper for making typed API requests to the backend.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/**
 * Typed fetch helper.
 * <T> lets TypeScript know what shape you expect back.
 *
 * Example:
 *   const data = await apiFetch<{ accounts: Account[] }>("/api/accounts");
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,

    // Critical for cookie-based auth (JWT stored in HttpOnly cookie)
    credentials: "include",

    // Default JSON headers (caller can override by passing options.headers)
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Normalize API errors into a single thrown Error(message)
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {
      // If server didn't return JSON, keep default message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
