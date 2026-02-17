/**
 * api.ts
 * -------------------------------------------------------
 * Helper for making typed API requests to the backend.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL;

export function getApiBaseOrThrow() {
  if (!API_BASE) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Set it in moneymate-web/.env.local (or your hosting env) to your backend URL, e.g. https://your-backend.com"
    );
  }
  return API_BASE.replace(/\/+$/, "");
}

type FieldErrorItem = { field?: string; message?: string } | string;

function isFieldErrorItem(x: unknown): x is { field?: string; message?: string } {
  return !!x && typeof x === "object" && ("field" in (x as any) || "message" in (x as any));
}

function buildMessageFromValidation(data: unknown) {
  const fieldErrors: Record<string, string> = {};
  const messages: string[] = [];

  const pushMessage = (m: unknown) => {
    const msg = typeof m === "string" ? m.trim() : "";
    if (msg) messages.push(msg);
  };

  const handleItems = (items: FieldErrorItem[]) => {
    for (const item of items) {
      if (typeof item === "string") {
        pushMessage(item);
        continue;
      }
      if (isFieldErrorItem(item)) {
        if (item.field && item.message) fieldErrors[item.field] = item.message;
        pushMessage(item.message);
      }
    }
  };

  if (Array.isArray(data)) {
    handleItems(data as FieldErrorItem[]);
  } else if (data && typeof data === "object") {
    const anyData = data as any;
    if (Array.isArray(anyData.errors)) {
      handleItems(anyData.errors as FieldErrorItem[]);
    }
    if (Array.isArray(anyData.message)) {
      handleItems(anyData.message as FieldErrorItem[]);
    }
  }

  const message = Array.from(new Set(messages)).join("\n");
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  return { message: message || null, fieldErrors: hasFieldErrors ? fieldErrors : undefined };
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  raw?: unknown;

  constructor(message: string, opts: { status: number; fieldErrors?: Record<string, string>; raw?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.fieldErrors = opts.fieldErrors;
    this.raw = opts.raw;
  }
}

export async function parseApiError(res: Response, fallbackMessage: string) {
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const normalized = buildMessageFromValidation(data);
  const message =
    normalized.message ||
    (data && typeof data === "object" && typeof (data as any).message === "string"
      ? String((data as any).message)
      : fallbackMessage);

  return new ApiError(message, { status: res.status, fieldErrors: normalized.fieldErrors, raw: data });
}

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
  const base = getApiBaseOrThrow();
  const res = await fetch(`${base}${path}`, {
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
    throw await parseApiError(res, "Request failed");
  }

  return res.json() as Promise<T>;
}
