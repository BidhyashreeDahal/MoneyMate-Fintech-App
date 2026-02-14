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
    <main>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transfers</h1>
          <p className="opacity-75 mt-1">
            Move money between your accounts.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          + New transfer
        </Button>
      </div>

      {loading && <p className="mt-4">Loading transfers...</p>}

      {!loading && error && (
        <div className="mt-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadTransfers} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && sortedTransfers.length === 0 && (
        <p className="mt-4 opacity-75">No transfers yet.</p>
      )}

      {!loading && !error && sortedTransfers.length > 0 && (
        <div className="mt-4 rounded-xl border bg-white overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="font-semibold">History</div>
            <div className="text-xs opacity-70">
              Showing {sortedTransfers.length} transfers
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-b">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">From</div>
            <div className="col-span-3">To</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {sortedTransfers.map((t) => (
            <div
              key={t._id}
              className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center hover:bg-gray-50"
            >
              <div className="col-span-2 text-sm opacity-75">
                {new Date(t.date).toLocaleDateString()}
              </div>

              <div className="col-span-3 text-sm truncate">
                {accountNameById[getAccountId(t.fromAccountId)] || "—"}
              </div>

              <div className="col-span-3 text-sm truncate">
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
