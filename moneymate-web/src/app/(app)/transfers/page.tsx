"use client";

import { useEffect, useMemo, useState } from "react";
import { listTransfers, type Transfer } from "@/lib/transfers";
import { listAccounts, type Account } from "@/lib/accounts";
import { Button } from "@/components/ui/button";
import CreateTransferModal from "@/components/transfers/createTransferModel";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  async function loadTransfers() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTransfers();
      setTransfers(data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const data = await listAccounts();
      setAccounts(data || []);
    } catch {
      // non-fatal
    }
  }

  useEffect(() => {
    loadTransfers();
    loadAccounts();
  }, []);

  function getAccountId(idOrObj: string | { _id: string }) {
    return typeof idOrObj === "string" ? idOrObj : idOrObj._id;
  }

  const accountNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of accounts) map[a._id] = a.name;
    return map;
  }, [accounts]);

  
  const sortedTransfers = useMemo(() => {
    return [...transfers].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transfers]);

  function getStatusStyles(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "reversed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Transfers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Move money between your accounts.
            </p>
          </div>

          <Button onClick={() => setCreateOpen(true)}>
            + New transfer
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-gray-500">
          Loading transfers...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-white p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadTransfers} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && sortedTransfers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-10 text-center">
          <div className="text-sm font-semibold text-gray-900">
            No transfers yet
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Create a transfer to move funds between accounts.
          </div>
          <div className="mt-4">
            <Button onClick={() => setCreateOpen(true)}>
              New transfer
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && sortedTransfers.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50/60">
            <div className="font-semibold">History</div>
            <div className="text-xs opacity-70">
              Showing {sortedTransfers.length} transfers
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">From</div>
            <div className="col-span-3">To</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {sortedTransfers.map((t) => (
            <div
              key={t._id}
              className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center hover:bg-emerald-50/40"
            >
              <div className="col-span-2 text-sm text-gray-500">
                {new Date(t.date).toLocaleDateString()}
              </div>

              <div className="col-span-3 text-sm text-gray-900 truncate">
                {accountNameById[getAccountId(t.fromAccountId)] || "—"}
              </div>

              <div className="col-span-3 text-sm text-gray-900 truncate">
                {accountNameById[getAccountId(t.toAccountId)] || "—"}
              </div>

              <div className="col-span-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs border ${getStatusStyles(
                    t.status
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              <div className="col-span-2 text-right font-semibold">
                {t.amount.toLocaleString(undefined, {
                  style: "currency",
                  currency: t.currency || "CAD",
                })}
              </div>

              {t.note?.trim() && (
                <div className="col-span-12 text-xs opacity-70 -mt-1 pb-2">
                  Note: {t.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateTransferModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadTransfers}
      />
    </main>
  );
}
