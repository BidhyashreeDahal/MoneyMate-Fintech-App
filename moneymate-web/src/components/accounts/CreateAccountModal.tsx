"use client";

/**
 * CreateAccountModal
 * -------------------------------------------------------
 * Bank-style modal UX:
 * - Uses accessible Dialog (focus trap, ESC closes, etc.)
 * - Shows validation errors clearly
 * - Has loading state to prevent double submits
 */

import { useState } from "react";
import { createAccount } from "@/lib/accounts";
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

const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "cash",
  "credit_card",
  "investment",
  "wallet",
] as const;

export default function CreateAccountModal({ open, onClose, onCreated }: Props) {
  // Form state (kept local to modal)
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof ACCOUNT_TYPES)[number]>("checking");
  const [currency, setCurrency] = useState("CAD");
  const [balance, setBalance] = useState<number>(0);

  // UX state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setType("checking");
    setCurrency("CAD");
    setBalance(0);
    setError(null);
  }

  async function handleCreate() {
    setError(null);

    // Frontend quick validation (backend still validates too)
    if (!name.trim()) {
      setError("Account name is required.");
      return;
    }
    if (!currency || currency.length !== 3) {
      setError("Currency must be a 3-letter code (e.g., CAD).");
      return;
    }
    if (!Number.isFinite(balance) || balance < 0) {
      setError("Balance must be 0 or more.");
      return;
    }

    setSubmitting(true);
    try {
      await createAccount({
        name: name.trim(),
        type,
        currency: currency.toUpperCase(),
        balance,
      });

      // Refresh list on parent page
      await onCreated();

      // Close + reset
      onClose();
      resetForm();
    } catch (e: any) {
      setError(e.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create account</DialogTitle>
          <DialogDescription>
            Add a new account to track balances and transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Account Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Account name</Label>
            <Input
              id="name"
              placeholder="Chequing Main"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency + Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="balance">Initial balance</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
