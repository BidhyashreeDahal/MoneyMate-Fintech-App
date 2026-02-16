"use client";

/**
 * UpdateAccountModal (Edit Account)
 * - Prefills from selected account
 * - Updates only allowed fields (no balance update)
 */

import { useEffect, useState } from "react";
import type { Account } from "@/lib/accounts";
import { updateAccount } from "@/lib/accounts";
import { iconMap } from "@/lib/iconMap.";
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

const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "cash",
  "credit_card",
  "investment",
  "wallet",
] as const;

type AccountType = (typeof ACCOUNT_TYPES)[number];

type Props = {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onUpdated: (updated: Account) => void | Promise<void>;
};

export default function UpdateAccountModal({ open, onClose, account, onUpdated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [currency, setCurrency] = useState("CAD");
  const [goalAmount, setGoalAmount] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [color, setColor] = useState("#4F46E5");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill on open
  useEffect(() => {
    if (!open || !account) return;

    setName(account.name ?? "");
    setType((account.type as AccountType) ?? "checking");
    setCurrency((account.currency ?? "CAD").toUpperCase());
    setGoalAmount(
      account.goalAmount === null || account.goalAmount === undefined
        ? ""
        : String(account.goalAmount)
    );
    setIcon(account.icon ?? undefined);
    setColor(account.color ?? "#4F46E5");
    setError(null);
  }, [open, account]);

  function resetForm() {
    setName("");
    setType("checking");
    setCurrency("CAD");
    setGoalAmount("");
    setIcon(undefined);
    setColor("#4F46E5");
    setError(null);
  }

  async function handleSave() {
    if (!account?._id) return;

    setError(null);

    if (!name.trim()) {
      setError("Account name is required.");
      return;
    }
    if (!currency || currency.length !== 3) {
      setError("Currency must be a 3-letter code (e.g., CAD).");
      return;
    }

    const goalStr = goalAmount.trim();
    const goal = goalStr ? Number(goalStr) : null;
    if (goal !== null && (!Number.isFinite(goal) || goal < 0)) {
        setError("Goal amount must be 0 or more.");
        return;
        }


    setSubmitting(true);
    try {
      // Backend allowedUpdates:
      // ["name", "type", "currency", "goalAmount", "color", "icon"]
      const payload: any = {
        name: name.trim(),
        type,
        currency: currency.toUpperCase(),
        goalAmount: goal,                  // null removes goal
        color: color.trim() || "#4F46E5",
        icon: icon ? icon : null,          // null clears icon
      };

      const updated = await updateAccount(account._id, payload);
      await onUpdated(updated);

      onClose();
      resetForm();
    } catch (e: any) {
      setError(e?.message || "Failed to update account");
    } finally {
      setSubmitting(false);
    }
  }

  // If no account selected, don't render (prevents crashes)
  if (!account) return null;

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
          <DialogTitle>Edit account</DialogTitle>
          <DialogDescription>
            Update details. Balance changes should come from transactions/transfers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Account name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border border-gray-300">
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem className="text-black data-[highlighted]:bg-gray-100" key={t} value={t}>
                    {t.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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

              <Button
                type="button"
                variant="ghost"
                className="justify-start px-0 text-sm text-muted-foreground"
                onClick={() => setIcon(undefined)}
              >
                Clear icon
              </Button>
            </div>
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
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
