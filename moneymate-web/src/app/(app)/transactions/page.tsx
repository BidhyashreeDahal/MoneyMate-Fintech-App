"use client";

/**
 * Transactions page (bank-style statement)
 * ------------------------------------------------------
 * - Loads transactions + accounts
 * - Shows professional statement table with header row
 * - Add transaction modal
 * - notes fallback logic (fixes "—" issue)
 */

import { useEffect, useMemo, useState } from "react";
import { listTransactions, type Transaction } from "@/lib/transactions";
import { listAccounts, type Account } from "@/lib/accounts";
import { archiveTransaction } from "@/lib/transactions";
import { Button } from "@/components/ui/button";
import CreateTransactionModal from "@/components/transactions/createTransactionModal";
import UpdateTransactionModal from "@/components/transactions/updateTransactionModal";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  async function loadTransactions() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTransactions();
      setTransactions(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const data = await listAccounts();
      setAccounts(data || []);
    } catch {
      // Not fatal for page
    }
  }

  useEffect(() => {
    loadTransactions();
    loadAccounts();
  }, []);

  // Map accountId -> name (so statement shows account names)
  const accountNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of accounts) map[a._id] = a.name;
    return map;
  }, [accounts]);

  function openEdit(tx: Transaction) {
    setSelectedTx(tx);
    setEditOpen(true);
  }

  function handleUpdated(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  }

  async function handleArchive(id: string) {
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    try {
      await archiveTransaction(id);
    } catch (e: any) {
      await loadTransactions();
      alert(e?.message || "Failed to archive transaction");
    }
    }


  return (
          <main>
            <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="opacity-75 mt-1">
            Your latest income and expenses across accounts.
          </p>
        </div>

        <Button className="font-bold" onClick={() => setCreateOpen(true)}>
          + Add transaction
        </Button>
      </div>


      {loading && <p className="mt-4">Loading transactions...</p>}

      {!loading && error && (
        <div className="mt-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadTransactions} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p className="mt-4 opacity-75">
          No transactions yet. Add your first one.
        </p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="mt-3 rounded-xl border bg-white overflow-hidden">
          {/* Table header band */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="font-semibold">Statement</div>
            <div className="text-xs opacity-70">
              Showing {transactions.length} transactions
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-b">
            <div className="col-span-2">Date</div>
            <div className="col-span-4">notes</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Account</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

      {/* Rows */}
      <div>
        {transactions.map((t) => {
          const isExpense = t.type === "expense";
          const isTransferTx =
            t.category === "Transfer In" || t.category === "Transfer Out" || t.type === "transfer";
          const displayDesc =
            t.notes && t.notes.trim()
              ? t.notes
              : "";

          const accountName = accountNameById[t.accountId] || "—";

          return (
            <div key={t._id}
             className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center hover:bg-gray-50">
                <div className="col-span-2 text-sm opacity-75">
                  {new Date(t.date).toLocaleDateString()}
                </div>

                <div className="col-span-4 text-sm truncate">
                  {displayDesc}
                </div>

                <div className="col-span-2 text-sm">{t.category}</div>

                <div className="col-span-2 text-sm opacity-80 truncate">
                  {accountName}
                </div>

                <div className="col-span-2 text-right">
                  <div className={`font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}>
                    {isExpense ? "-" : "+"}
                    {t.amount.toLocaleString(undefined, {
                      style: "currency",
                      currency: t.currency || "CAD",
                    })}
                  </div>
                  <div className="mt-1 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isTransferTx}
                      onClick={() => openEdit(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(t._id)}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
          );
        })}
      </div>
    </div>
  )}

  {/* Modal */}
  <CreateTransactionModal
    open={createOpen}
    onClose={() => setCreateOpen(false)}
    onCreated={loadTransactions}
  />
  <UpdateTransactionModal
    open={editOpen}
    onClose={() => setEditOpen(false)}
    transaction={selectedTx}
    accounts={accounts}
    onUpdated={handleUpdated}
  />
</main>
  );
}
