import { parseApiError } from "./api";

export type ParsedReceipt = {
  merchant: string | null;
  total: number | null;
  date: string | null; // YYYY-MM-DD
  category: string | null;
  currency: string | null;
};

export async function parseReceiptAI(
  file: File
): Promise<ParsedReceipt> {
  const formData = new FormData();
  formData.append("receipt", file);

  // Local uses env variable
  // Production uses relative path (Vercel rewrite)
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

  const res = await fetch(`${base}/api/receipts/parse`, {
    method: "POST",
    body: formData,
    credentials: "include", // keep for cookie auth
  });

  if (!res.ok) {
    throw await parseApiError(res, "Receipt parse failed");
  }

  const data = await res.json();
  return data.receipt;
}
