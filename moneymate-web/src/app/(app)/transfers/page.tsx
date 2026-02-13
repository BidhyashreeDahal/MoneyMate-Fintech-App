"use client";

/**
 * Transfers page
 * -------------------------------------------------------
 * - Lists transfers (separate from transactions)
 * - Create transfer modal
 *
 * Note: You haven't shared listTransfers controller yet.
 * This page assumes GET /api/transfers returns:
 *   { transfers: Transfer[] }
 */

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

  return (
    <main>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transfers</h1>
          <p className="opacity-75 mt-1">Move money between your accounts.</p>
        </div>

        <Button className="font-bold" onClick={() => setCreateOpen(true)}>
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

      {!loading && !error && transfers.length === 0 && (
        <p className="mt-4 opacity-75">No transfers yet.</p>
      )}

      {!loading && !error && transfers.length > 0 && (
        <div className="mt-3 rounded-xl border bg-white overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="font-semibold">History</div>
            <div className="text-xs opacity-70">
              Showing {transfers.length} transfers
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-b">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">From</div>
            <div className="col-span-3">To</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {transfers.map((t) => (
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

              <div className="col-span-2 text-sm">
                {t.status}
              </div>

              <div className="col-span-2 text-right font-semibold">
                {t.amount.toLocaleString(undefined, {
                  style: "currency",
                  currency: t.currency || "CAD",
                })}
              </div>

              {/* Optional: show note under row if present */}
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
