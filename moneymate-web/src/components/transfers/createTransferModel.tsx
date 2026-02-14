"use client";

/**
 * CreateTransferModal
 * -------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import { createTransfer } from "@/lib/transfers";
import { type Account, listAccounts } from "@/lib/accounts";
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
  onCreated: () => Promise<void> | void; // parent refresh hook
};

function toISODateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// stable ISO conversion
function dateInputToISO(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  return dt.toISOString();
}

export default function CreateTransferModal({ open, onClose, onCreated }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState(""); // IMPORTANT: Transfer schema uses `note`
  const [date, setDate] = useState(toISODateInputValue(new Date()));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown readability (local only, doesn't touch global theme)
  const triggerClass = "bg-white text-black border border-gray-300";
  const contentClass =
    "bg-white text-black border border-gray-300 shadow-md z-[9999]";
  const itemClass =
    "text-black data-[highlighted]:bg-gray-100 data-[highlighted]:text-black";

  const availableAccounts = useMemo(
    () => (accounts || []).filter((a: any) => !a.archived),
    [accounts]
  );

  const fromAccount = useMemo(
    () => availableAccounts.find((a) => a._id === fromAccountId),
    [availableAccounts, fromAccountId]
  );
  const toAccount = useMemo(
    () => availableAccounts.find((a) => a._id === toAccountId),
    [availableAccounts, toAccountId]
  );

  async function loadAccountsForSelect() {
    setAccountsLoading(true);
    try {
      const data = await listAccounts();
      setAccounts(data || []);

      // default selections (only if empty)
      const active = (data || []).filter((a: any) => !a.archived);
      if (!fromAccountId && active.length > 0) setFromAccountId(active[0]._id);

      // pick a different default for toAccount if possible
      if (!toAccountId && active.length > 1) setToAccountId(active[1]._id);
      else if (!toAccountId && active.length === 1) setToAccountId(active[0]._id);
    } finally {
      setAccountsLoading(false);
    }
  }

  function resetForm() {
    setAmount("");
    setNote("");
    setDate(toISODateInputValue(new Date()));
    setError(null);
  }

  useEffect(() => {
    if (!open) return;
    setError(null);
    loadAccountsForSelect().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /**
   * If user changes "from", and it equals "to", auto-fix "to" to a different account when possible.
   */
  useEffect(() => {
    if (!open) return;
    if (!fromAccountId || !toAccountId) return;

    if (fromAccountId === toAccountId) {
      const candidate = availableAccounts.find((a) => a._id !== fromAccountId);
      if (candidate) setToAccountId(candidate._id);
    }
  }, [fromAccountId, toAccountId, open, availableAccounts]);

  async function handleCreate() {
    setError(null);

    if (!fromAccountId) return setError("Select a source account.");
    if (!toAccountId) return setError("Select a destination account.");
    if (fromAccountId === toAccountId)
      return setError("Source and destination accounts must be different.");

    if (!amount.trim()) return setError("Amount is required.");
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("Amount must be greater than 0.");

    // IMPORTANT: backend blocks currency mismatch; we can pre-check for better UX
    if (fromAccount && toAccount && fromAccount.currency !== toAccount.currency) {
      return setError("Currency mismatch between accounts.");
    }

    setSubmitting(true);
    try {
      await createTransfer({
        fromAccountId,
        toAccountId,
        amount: amt,
        note: note.trim() ? note.trim() : undefined,
        date: date ? dateInputToISO(date) : undefined,
      });

      await onCreated(); // refresh transfers page or transactions page
      onClose();
      resetForm();
    } catch (e: any) {
      setError(e?.message || "Failed to create transfer.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <DialogTitle className="text-base font-semibold">
            Transfer between accounts
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Moves money between your accounts. This creates two ledger transactions automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm">From</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
                </SelectTrigger>
                <SelectContent position="popper" className={`${contentClass} max-h-60 overflow-y-auto`}>
                  {availableAccounts.map((a) => (
                    <SelectItem key={a._id} value={a._id} className={itemClass}>
                      {a.name} • {a.type.toUpperCase()} • {a.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm">To</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
                </SelectTrigger>
                <SelectContent position="popper" className={`${contentClass} max-h-60 overflow-y-auto`}>
                  {availableAccounts.map((a) => (
                    <SelectItem key={a._id} value={a._id} className={itemClass}>
                      {a.name} • {a.type.toUpperCase()} • {a.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount / Date */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Note */}
          <div className="grid gap-2">
            <Label className="text-sm" htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              className="bg-white text-black border border-gray-300"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Move rent money to chequing"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={submitting} onClick={() => { onClose(); resetForm(); }}>
            Cancel
          </Button>
          <Button disabled={submitting || accountsLoading} onClick={handleCreate}>
            {submitting ? "Transferring..." : "Make transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
