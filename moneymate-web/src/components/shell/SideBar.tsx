"use client";
/**
 * Sidebar navigation
 * Persistent Navigration
 * */
import Link from "next/link";

const nav =[
    {href: "/dashboard", label: "Dashboard"},
     {href: "/accounts", label: "Accounts"},
    {href: "/transactions", label: "Transactions"},
    {href: "/transfers", label: "Transfers"},
    {href: "/budgets", label: "Budgets"},
    {href: "/insights", label: "Insights"},
];

export default function Sidebar() {
    return(
        <aside style={{
            width: 260,
            borderRight: "1px solid #eee",
            padding : 16,
        }}
        > 
        <div style ={{ fontWeight: 700, marginBottom: 16}}>MoneyMate</div>
        <nav style ={{ display : "grid", gap: 10}}>
        {nav.map((item => (
            <Link key ={item.href} href={item.href}>{item.label}</Link>
        )))}
        </nav>
        </aside>
    );
}