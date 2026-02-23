"use client";

/**
 * CreateTransactionModal
 * -------------------------------------------------------
 * - Loads user's accounts when modal opens
 * - Validates inputs before API call
 * - Converts amount safely (string -> number)
 * - Converts date input to stable ISO (avoids timezone shifting)
 * - Forces Select dropdown readability WITHOUT touching global theme
 */

import { useEffect, useMemo, useState } from "react";
import { createTransaction } from "@/lib/transactions";
import { listAccounts, type Account } from "@/lib/accounts";
import { parseReceiptAI } from "@/lib/receipts";
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
  onCreated: () => Promise<void> | void;
};

const TX_TYPES = ["expense", "income"] as const;

function toISODateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Use midday to avoid timezone shifting issues
function dateInputToISO(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  return dt.toISOString();
}

export default function CreateTransactionModal({ open, onClose, onCreated }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<(typeof TX_TYPES)[number]>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(TRANSACTION_CATEGORIES[0]);
  const [date, setDate] = useState(toISODateInputValue(new Date()));
  const [notes, setDescription] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [parsingReceipt, setParsingReceipt] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a._id === accountId),
    [accounts, accountId]
  );

  async function loadAccountsForSelect() {
    setAccountsLoading(true);
    try {
      const data = await listAccounts();
      setAccounts(data || []);

      // default account (only if not already chosen)
      if (!accountId && data && data.length > 0) setAccountId(data[0]._id);
    } catch (e: any) {
      setError(e?.message || "Failed to load accounts.");
    } finally {
      setAccountsLoading(false);
    }
  }

  function resetForm() {
    setType("expense");
    setAmount("");
    setCategory(TRANSACTION_CATEGORIES[0]);
    setDate(toISODateInputValue(new Date()));
    setDescription("");
    setReceiptFile(null);
    setError(null);
  }

  useEffect(() => {
    if (!open) return;
    setError(null);
    loadAccountsForSelect().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleCreate() {
    setError(null);

    if (!accountId) return setError("Please select an account.");
    if (!amount.trim()) return setError("Amount is required.");

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return setError("Amount must be greater than 0.");
    if (!category.trim()) return setError("Category is required.");
    if (!date) return setError("Date is required.");

    setSubmitting(true);
    try {
      await createTransaction({
        accountId,
        type,
        amount: amt,
        category: category.trim(),
        date: dateInputToISO(date),
        notes: notes.trim() ? notes.trim() : undefined,
      });

      await onCreated();
      onClose();
      resetForm();
    } catch (e: any) {
      setError(e?.message || "Failed to create transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleParseReceipt() {
    if (!receiptFile) return;
    setError(null);
    setParsingReceipt(true);
    try {
      const data = await parseReceiptAI(receiptFile);
      if (data?.total != null) setAmount(String(data.total));
      if (data?.date) setDate(data.date);
      if (data?.category) setCategory(data.category);
      if (data?.merchant && !notes.trim()) {
        setDescription(data.merchant);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to parse receipt.");
    } finally {
      setParsingReceipt(false);
    }
  }

  // Reusable classes to make dropdown readable everywhere
  const triggerClass =
    "bg-white text-black border border-gray-300";
  const contentClass =
    "bg-white text-black border border-gray-300 shadow-md z-[9999]";
  const itemClass =
    "text-black data-[highlighted]:bg-gray-100 data-[highlighted]:text-black";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add transaction</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Record an income or expense. You can attach receipts later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Account */}
          <div className="grid gap-2">
            <Label className="text-sm">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
              </SelectTrigger>

              <SelectContent position="popper" className={contentClass}>
                {accounts.map((a) => (
                  <SelectItem className={itemClass} key={a._id} value={a._id}>
                    {a.name} • {a.type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAccount && (
              <p className="text-xs text-gray-600">
                Currency: {selectedAccount.currency || "CAD"}
              </p>
            )}
          </div>

          {/* Type + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent position="popper" className={contentClass}>
                  {TX_TYPES.map((t) => (
                    <SelectItem className={itemClass} key={t} value={t}>
                      {t.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm" htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                className="bg-white text-black border border-gray-300"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
               <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  className={`${contentClass} max-h-60 overflow-y-auto`}
                >
                  {TRANSACTION_CATEGORIES.map((c) => (
                    <SelectItem className={itemClass} key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm" htmlFor="date">Date</Label>
              <Input
                id="date"
                className="bg-white text-black border border-gray-300"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Receipt AI */}
          <div className="grid gap-2">
            <Label className="text-sm" htmlFor="receipt">
              Receipt (optional)
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="receipt"
                className="bg-white text-black border border-gray-300"
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!receiptFile || parsingReceipt}
                onClick={handleParseReceipt}
              >
                {parsingReceipt ? "Parsing..." : "Auto-fill from receipt"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use AI to extract amount, date, and category.
            </p>
          </div>

          {/* notes */}
          <div className="grid gap-2">
            <Label className="text-sm" htmlFor="notes">notes (optional)</Label>
            <Input
              id="notes"
              className="bg-white text-black border border-gray-300"
              value={notes}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Tim Hortons"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button disabled={submitting || accountsLoading} onClick={handleCreate}>
            {submitting ? "Saving..." : "Save transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
