"use client";
/**
 * Accounts page
 * ------------------------------------------------------
 * fetches accounts from backend
 * shows loading , error and empty state
 * */
import { useEffect, useState } from "react";
import CreateAccountModal from "@/components/accounts/CreateAccountModal";
import {type Account, listAccounts } from "@/lib/accounts";


type Account ={
    _id : string;
    name : string;
    type: string;
    currency : string;
    balance : number;
    archived : boolean;
}
export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState (true);
    const [error, setError] = useState<string |null>(null);
    const [modalOpen, setModalOpen] = useState(false);


    async function loadAccounts(){
        setLoading (true); // show loading state
        setError (null); // clear previous error
        try{
            const data = await listAccounts(); //Call backend: GET http://localhost:5000/api/accounts
            setAccounts (data || []); // Save account to the react state
        } catch(e:any){
            setError (e.message || "Failed to load accounts");
        }finally{
            setLoading (false);
        }

    }
    useEffect(() => {
        loadAccounts();
    }, []);
    return (
    <main>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Accounts</h1>

        <div
            style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            >
            <p style={{ margin: 0, opacity: 0.75 }}>Your accounts</p>

            <button
                onClick={() => setModalOpen(true)}
                style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                fontWeight: 700,
                cursor: "pointer",
                }}
            >
                + Add account
            </button>
        </div>

      

      {loading && <p style={{ marginTop: 12 }}>Loading accounts...</p>}

      {!loading && error && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: "crimson" }}>{error}</p>
          <button onClick={loadAccounts} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <p style={{ marginTop: 12 }}>No accounts yet. Create your first account.</p>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {accounts.map((a) => (
            <div
              key={a._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  {a.type.toUpperCase()} • {a.currency}
                </div>
              </div>

              <div style={{ fontWeight: 700 }}>
                {a.balance.toLocaleString(undefined, {
                  style: "currency",
                  currency: a.currency || "CAD",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <CreateAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadAccounts}
        />
    </main>
  );
}