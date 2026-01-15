"use client";
/**
 * Transaction page
 * ------------------------------------------------------
 * Fetches transactions from backend**/
import {useEffect, useState} from "react";
import {listTransactions, type Transaction} from "@/lib/transactions";
import {Button} from "@/components/ui/button";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadTransactions() {
        setLoading(true);
        setError(null);
        try{
            const data = await listTransactions();
            setTransactions(data || []);
        } catch (err) {
            setError((err as Error).message || "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadTransactions();
    }, []);

    return (
    <main>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button className="font-bold">+ Add transaction</Button>
      </div>

      {loading && <p>Loading transactions...</p>}

      {!loading && error && (
        <div className="mt-3">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadTransactions} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p className="opacity-75">
          No transactions yet. Add your first one.
        </p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          {transactions.map((t) => (
            <div
              key={t._id}
              className="grid grid-cols-5 gap-4 px-4 py-3 border-b last:border-b-0 items-center"
            >
              {/* Date */}
              <div className="text-sm opacity-75">
                {new Date(t.date).toLocaleDateString()}
              </div>

              {/* Description */}
              <div className="font-medium">
                {t.description || "—"}
              </div>

              {/* Category */}
              <div className="text-sm">{t.category}</div>

              {/* Type */}
              <div className="text-sm capitalize">{t.type}</div>

              {/* Amount */}
              <div
                className={`text-right font-semibold ${
                  t.type === "expense"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {t.type === "expense" ? "-" : "+"}
                {t.amount.toLocaleString(undefined, {
                  style: "currency",
                  currency: "CAD",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

