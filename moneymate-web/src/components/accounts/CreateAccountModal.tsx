"use client";
/**
 * CreateAccount Modal
 */

import { useState } from "react";
import {createAccount, CreateAccountInput} from "@/lib/accounts";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated:() => Promise<void>; //refresh account list after created
};

export default function CreateAccountModal({ open, onClose, onCreated }: Props) {
    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState< CreateAccountInput["type"]>("checking");
    const [currency, setCurrency] = useState("CAD");
    const [balance, setBalance] = useState<string>("0");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if(!open) return null; //don't render if not open

    async function handleSubmit (e: React.FormEvent){
        e.preventDefault();
        setError (null);
    
    if(!name.trim()){
        setError ("Name is required");
        return;
    }

    const startingBalance = Number(balance);
    if(!Number.isFinite (startingBalance) || startingBalance < 0){
        setError ("Starting balance must be a non-negative number");
        return;
    }
    setSubmitting (true);
    try{
        await createAccount({
            name: name.trim(),
            type,
            currency: currency.trim().toUpperCase(),
            balance: startingBalance,
        });
        await onCreated(); //refresh account list

        //reset form
        setName ("");
        setType ("checking");
        setCurrency ("CAD");
        setBalance (0);
        onClose(); //close modal
    } catch (e:any){
        setError (e.message || "Failed to create account");
    } finally{
        setSubmitting (false);
    }
    }
    return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
      onClick={onClose} // click outside closes modal
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "white",
          borderRadius: 16,
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add account</h2>
        <p style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
          Create a new account to track balances like a real bank ledger.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Account name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Checking"
              style={{ width: "100%", marginTop: 6, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{ width: "100%", marginTop: 6, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="investment">Investment</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Currency</label>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="CAD"
                style={{ width: "100%", marginTop: 6, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Starting balance</label>
              <input
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                style={{ width: "100%", marginTop: 6, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: "crimson", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>

            <button type="submit" disabled={submitting} style={{ fontWeight: 700 }}>
              {submitting ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
