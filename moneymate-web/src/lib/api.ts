/**
 * api.ts
 * -------------------------------------------------------
 * Helper for making typed API requests to the backend.
 * Supports:
 * - Local dev (NEXT_PUBLIC_API_URL=http://localhost:5000)
 * - Production (Vercel rewrite proxy using relative /api paths)
 */

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

  return new ApiError(message, {
    status: res.status,
    fieldErrors: normalized.fieldErrors,
    raw: data,
  });
}

/**
 * Typed fetch helper.
 * Automatically supports:
 * - Local backend via NEXT_PUBLIC_API_URL
 * - Production via Vercel rewrite proxy (/api)
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // If env exists (local), use it.
  // If not (production), use relative path.
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

  const res = await fetch(`${base}${path}`, {
    ...options,
    credentials: "include", // required for cookie auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw await parseApiError(res, "Request failed");
  }

  return res.json() as Promise<T>;
}
