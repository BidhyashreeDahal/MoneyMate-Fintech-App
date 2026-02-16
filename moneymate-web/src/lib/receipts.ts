import { API_BASE } from "./api";

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

  const res = await fetch(`${API_BASE}/api/receipts/parse`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Receipt parse failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.receipt;
}
