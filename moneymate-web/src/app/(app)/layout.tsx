/**
 * App layout
 * ------------------------------------------------------
 * Protests all logges-in pages
 * Provides session context to all pages.
 * Redirects to /login if user is not authenticated.
 */
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";
import AppShell from "@/components/shell/AppShell";

export default function AppLayout({ children }:{ children : React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if(loading) return; // still loading
    if(!user) router.replace("/login");
    }, [loading, user, router]);

    if(loading){
        return <p style ={{padding: 24}}>Loading session...</p>;
    }
    if(!user){
        return null; // redirecting
    }
    return <AppShell>{children}</AppShell>
  };