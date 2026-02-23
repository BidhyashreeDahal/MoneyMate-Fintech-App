"use client";

import { useEffect, useMemo, useState } from "react";
import { updateTransaction, uploadReceipt, type Transaction } from "@/lib/transactions";
import { type Account } from "@/lib/accounts";
import { TRANSACTION_CATEGORIES } from "@/lib/categories";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  accounts: Account[];
  onUpdated: (tx: Transaction) => void;
};

const TX_TYPES = ["expense", "income"] as const;

function toISODateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateInputToISO(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  return dt.toISOString();
}

export default function UpdateTransactionModal({
  open,
  onClose,
  transaction,
  accounts,
  onUpdated,
}: Props) {
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<(typeof TX_TYPES)[number]>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(TRANSACTION_CATEGORIES[0]);
  const [date, setDate] = useState(toISODateInputValue(new Date()));
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a._id === accountId),
    [accounts, accountId]
  );

  const isTransferTx =
    transaction?.category === "Transfer In" ||
    transaction?.category === "Transfer Out" ||
    transaction?.type === "transfer";

  useEffect(() => {
    if (!open || !transaction) return;

    setAccountId(transaction.accountId);
    setType(transaction.type === "income" ? "income" : "expense");
    setAmount(String(transaction.amount ?? ""));
    setCategory(transaction.category || TRANSACTION_CATEGORIES[0]);
    setDate(toISODateInputValue(new Date(transaction.date)));
    setNotes(transaction.notes || "");
    setReceiptFile(null);
    setError(null);
  }, [open, transaction]);

  async function handleSave() {
    if (!transaction) return;

    setError(null);
    if (!accountId) return setError("Please select an account.");
    if (!amount.trim()) return setError("Amount is required.");

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("Amount must be greater than 0.");
    if (!category.trim()) return setError("Category is required.");
    if (!date) return setError("Date is required.");

    setSubmitting(true);
    try {
      const updated = await updateTransaction(transaction._id, {
        accountId,
        type,
        amount: amt,
        category: category.trim(),
        date: dateInputToISO(date),
        notes: notes.trim() ? notes.trim() : undefined,
      });

      let finalTx = updated;
      if (receiptFile) {
        finalTx = await uploadReceipt(transaction._id, receiptFile);
      }

      onUpdated(finalTx);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to update transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  // Base for local OR production proxy
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
          <DialogDescription>
            Update details or attach a receipt.
          </DialogDescription>
        </DialogHeader>

        {isTransferTx && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
            Transfer transactions cannot be edited.
          </p>
        )}

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId} disabled={isTransferTx}>
              <SelectTrigger id="edit-account" className="bg-white text-black border border-gray-300">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border border-gray-300 z-[100]">
                {accounts.filter((a) => !a.archived).map((acc) => (
                  <SelectItem key={acc._id} value={acc._id} className="text-black data-[highlighted]:bg-gray-100">
                    {acc.name} ({acc.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")} disabled={isTransferTx}>
                <SelectTrigger id="edit-type" className="bg-white text-black border border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 z-[100]">
                  <SelectItem value="expense" className="text-black data-[highlighted]:bg-gray-100">Expense</SelectItem>
                  <SelectItem value="income" className="text-black data-[highlighted]:bg-gray-100">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white text-black border border-gray-300"
                disabled={isTransferTx}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isTransferTx}>
              <SelectTrigger id="edit-category" className="bg-white text-black border border-gray-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border border-gray-300 z-[100] max-h-60 overflow-y-auto">
                {TRANSACTION_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-black data-[highlighted]:bg-gray-100">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white text-black border border-gray-300"
              disabled={isTransferTx}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Input
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. merchant name"
              className="bg-white text-black border border-gray-300"
              disabled={isTransferTx}
            />
          </div>

          {transaction?.receiptUrl && (
            <div className="grid gap-1">
              <Label>Receipt</Label>
              <a
                className="text-sm text-blue-600 underline"
                href={
                  /^https?:\/\//i.test(transaction.receiptUrl)
                    ? transaction.receiptUrl
                    : `${base}${transaction.receiptUrl}`
                }
                target="_blank"
                rel="noreferrer"
              >
                View current receipt
              </a>
            </div>
          )}

          {!isTransferTx && (
            <div className="grid gap-2">
              <Label htmlFor="edit-receipt">Replace receipt (optional)</Label>
              <Input
                id="edit-receipt"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="bg-white text-black border border-gray-300"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={submitting} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={submitting || isTransferTx} onClick={handleSave}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
