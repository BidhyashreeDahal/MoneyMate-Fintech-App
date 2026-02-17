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
import ConfirmDialog from "@/components/ui/confirm-dialog";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Transaction | null>(null);
  const [archiving, setArchiving] = useState(false);

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

  function requestArchive(tx: Transaction) {
    setArchiveTarget(tx);
    setArchiveOpen(true);
  }

  async function confirmArchive() {
    if (!archiveTarget) return;
    const target = archiveTarget;
    setArchiving(true);
    setArchiveOpen(false);
    setArchiveTarget(null);
    setTransactions((prev) => prev.filter((tx) => tx._id !== target._id));
    try {
      await archiveTransaction(target._id);
      toast({
        title: "Transaction archived",
        description: "The transaction was archived successfully.",
        variant: "success",
      });
    } catch (e: any) {
      await loadTransactions();
      setError(e?.message || "Failed to archive transaction");
    } finally {
      setArchiving(false);
    }
  }


  return (
          <main className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your latest income and expenses across accounts.
          </p>
        </div>

        <Button className="font-semibold" onClick={() => setCreateOpen(true)}>
          + Add transaction
        </Button>
      </div>
      </div>


      {loading && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-gray-500">
          Loading transactions...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-white p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadTransactions} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <EmptyState
          title="No transactions yet"
          description="Transactions track income and expenses across your accounts."
          actionLabel="Add transaction"
          onActionClick={() => setCreateOpen(true)}
        />
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden">
          {/* Table header band */}
          <div className="px-4 py-3 border-b bg-emerald-50/60">
            <div className="font-semibold">Statement</div>
            <div className="text-xs opacity-70">
              Showing {transactions.length} transactions
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
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
             className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center hover:bg-emerald-50/40">
                <div className="col-span-2 text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString()}
                </div>

                <div className="col-span-4 text-sm text-gray-900 truncate">
                  {displayDesc}
                </div>

                <div className="col-span-2 text-sm text-gray-700">{t.category}</div>

                <div className="col-span-2 text-sm text-gray-500 truncate">
                  {accountName}
                </div>

                <div className="col-span-2 text-right">
                  <div className={`font-semibold ${isExpense ? "text-red-600" : "text-emerald-600"}`}>
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
                      onClick={() => requestArchive(t)}
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
    onCreated={async () => {
      await loadTransactions();
      toast({
        title: "Transaction added",
        description: "Your transaction has been saved.",
        variant: "success",
      });
    }}
  />
  <UpdateTransactionModal
    open={editOpen}
    onClose={() => setEditOpen(false)}
    transaction={selectedTx}
    accounts={accounts}
    onUpdated={handleUpdated}
  />
  <ConfirmDialog
    open={archiveOpen}
    title="Archive transaction?"
    description="Archive this transaction? This cannot be undone."
    confirmText="Archive"
    onConfirm={confirmArchive}
    onCancel={() => {
      if (archiving) return;
      setArchiveOpen(false);
      setArchiveTarget(null);
    }}
    loading={archiving}
  />
</main>
  );
}
