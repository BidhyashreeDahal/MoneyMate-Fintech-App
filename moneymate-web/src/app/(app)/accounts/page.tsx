"use client";
/**
 * Accounts page
 * ------------------------------------------------------
 * fetches accounts from backend
 * shows loading , error and empty state
 * */
import { useEffect, useState } from "react";
import CreateAccountModal from "@/components/accounts/CreateAccountModal";
import { listAccounts, type Account, archiveAccount } from "@/lib/accounts";
import { iconMap } from "@/lib/iconMap.";
import { Button } from "@/components/ui/button";
import EditAccountModal from "@/components/accounts/UpdateAccountModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";



export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState (true);
    const [error, setError] = useState<string |null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [archiveTarget, setArchiveTarget] = useState<Account | null>(null);
    const [archiving, setArchiving] = useState(false);

function openEdit(account: Account) {
  setSelectedAccount(account);
  setEditOpen(true);
}

function handleUpdated(updated: Account) {
  setAccounts((prev) =>
    prev.map((a) => (a._id === updated._id ? updated : a))
  );
}

function requestArchive(account: Account) {
  setArchiveTarget(account);
  setArchiveOpen(true);
}

async function confirmArchive() {
  if (!archiveTarget) return;
  const target = archiveTarget;
  setArchiving(true);
  setArchiveOpen(false);
  setArchiveTarget(null);
  setAccounts((prev) => prev.filter((a) => a._id !== target._id));
  try {
    await archiveAccount(target._id);
  } catch (e: any) {
    await loadAccounts();
    setError(e?.message || "Failed to archive account");
  } finally {
    setArchiving(false);
  }
}

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
      <h1 className="text-2xl font-bold">Accounts</h1>

        <div className="mt-3 flex justify-between items-center">
            <p className="opacity-75">Your accounts</p>

            <Button
                onClick={() => setModalOpen(true)}
                className="font-bold"
            >
                + Add account
            </Button>
        </div>

      {loading && <p className="mt-3">Loading accounts...</p>}

      {!loading && error && (
        <div className="mt-3">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadAccounts} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <p className="mt-3">No accounts yet. Create your first account.</p>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="mt-4 grid gap-3">
          {accounts.map((a) => {
            const IconComponent = a.icon ? iconMap[a.icon] : iconMap.wallet;
            const Icon = IconComponent || iconMap.wallet;
            const borderColor = a.color || "#4F46E5";
            const goalProgress = a.goalAmount && a.goalAmount > 0 
              ? Math.min((a.balance / a.goalAmount) * 100, 100) 
              : null;

            return (
              <div
                key={a._id}
                className="border-2 rounded-xl p-4 bg-white"
                style={{ borderColor: borderColor }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${borderColor}20`,
                        color: borderColor,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-base">{a.name}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {a.type.toUpperCase()} • {a.currency}
                      </div>
                    </div>
                  </div>
                <div className="text-right">
                  <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2"
                        onClick={() => openEdit(a)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2"
                        onClick={() => requestArchive(a)}
                    >
                        Archive
                    </Button>
                    <div className="font-bold text-lg">
                      {a.balance.toLocaleString(undefined, {
                        style: "currency",
                        currency: a.currency || "CAD",
                      })}
                    </div>
                    {a.goalAmount && a.goalAmount > 0 && (
                      <div className="text-xs opacity-70 mt-1">
                        Goal: {a.goalAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: a.currency || "CAD",
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {goalProgress !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="opacity-70">Progress</span>
                      <span className="font-semibold">{goalProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${goalProgress}%`,
                          backgroundColor: borderColor,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CreateAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadAccounts}
        />
        <EditAccountModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        account={selectedAccount}
        onUpdated={handleUpdated}
        />
        <ConfirmDialog
          open={archiveOpen}
          title="Archive account?"
          description={
            archiveTarget
              ? `Archive "${archiveTarget.name}"? This cannot be undone.`
              : "Archive this account? This cannot be undone."
          }
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