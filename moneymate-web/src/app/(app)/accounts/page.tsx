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
import { iconMap } from "@/lib/iconMap";
import { Button } from "@/components/ui/button";
import EditAccountModal from "@/components/accounts/UpdateAccountModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";



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
    const { toast } = useToast();

function openEdit(account: Account) {
  setSelectedAccount(account);
  setEditOpen(true);
}

function handleUpdated(updated: Account) {
  setAccounts((prev) =>
    prev.map((a) => (a._id === updated._id ? updated : a))
  );
  toast({
    title: "Account updated",
    description: `Updated ${updated.name}.`,
    variant: "success",
  });
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
    toast({
      title: "Account archived",
      description: `Archived ${target.name}.`,
      variant: "success",
    });
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
            const data = await listAccounts(); // Call backend: GET /api/accounts
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
    <main className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Accounts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your accounts and track balances at a glance.
            </p>
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            className="font-semibold"
          >
            + Add account
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-gray-500">
          Loading accounts...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-white p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadAccounts} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <EmptyState
          title="No accounts yet"
          description="Create an account to start tracking balances, goals, and transactions."
          actionLabel="Create account"
          onActionClick={() => setModalOpen(true)}
        />
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="grid gap-4">
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
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow-md transition"
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
                      <div className="font-semibold text-base text-gray-900">{a.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
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
                    <div className="font-semibold text-lg text-gray-900">
                      {a.balance.toLocaleString(undefined, {
                        style: "currency",
                        currency: a.currency || "CAD",
                      })}
                    </div>
                    {a.goalAmount && a.goalAmount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
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
                    <div className="flex justify-between text-xs mb-1 text-gray-500">
                      <span>Progress</span>
                      <span className="font-semibold">{goalProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-100/60 rounded-sm overflow-hidden">
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
        onCreated={async () => {
          await loadAccounts();
          toast({
            title: "Account created",
            description: "Your new account is ready.",
            variant: "success",
          });
        }}
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