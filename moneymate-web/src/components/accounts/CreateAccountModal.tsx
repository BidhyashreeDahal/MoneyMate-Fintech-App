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
import { iconMap } from "@/lib/iconMap";
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
  const [balance, setBalance] = useState("0");
  const [goalAmount, setGoalAmount] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [color, setColor] = useState("#4F46E5");


  // UX state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setType("checking");
    setCurrency("CAD");
    setBalance("0");
    setGoalAmount("");
    setIcon(undefined);
    setColor("#4F46E5");
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
    const bal = Number(balance);
    if (!Number.isFinite(bal) || bal < 0) {
      setError("Balance must be 0 or more.");
      return;
    }

    const goal = goalAmount.trim() ? Number(goalAmount) : undefined;
    if (goal !== undefined && (!Number.isFinite(goal) || goal < 0)) {
      setError("Goal amount must be 0 or more.");
      return;
    }

    setSubmitting(true);
    try {
      const accountData: any = {
        name: name.trim(),
        type,
        currency: currency.toUpperCase(),
        balance: bal,
        color: color.trim() || "#4F46E5",
      };
      
      // Only include icon if user has selected one
      if (icon) {
        accountData.icon = icon;
      }
      
      // Only include goalAmount if provided
      if (goal !== undefined) {
        accountData.goalAmount = goal;
      }

      await createAccount(accountData);

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
    <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                resetForm();
                onClose();
                }
            }}
    >
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
                onChange={(e) => setBalance(e.target.value)} // keep raw string
                min={0}
                step="0.01"
              />

            </div>
          </div>

          {/* Goal Amount + Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goalAmount">Goal amount (optional)</Label>
              <Input
                id="goalAmount"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                min={0}
                step="0.01"
                placeholder="Leave empty for no goal"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 cursor-pointer p-1"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#4F46E5"
                  className="flex-1"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="grid gap-2">
            <Label>Icon (optional)</Label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(iconMap).map(([iconName, IconComponent]) => {
                const Icon = IconComponent as React.ComponentType<{ className?: string }>;
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex items-center justify-center h-10 w-10 rounded-md border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
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
