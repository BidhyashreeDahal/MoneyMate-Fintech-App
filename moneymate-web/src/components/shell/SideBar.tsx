"use client";
/**
 * Sidebar navigation
 * Persistent Navigration
 * */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const nav =[
    {href: "/dashboard", label: "Dashboard"},
     {href: "/accounts", label: "Accounts"},
    {href: "/transactions", label: "Transactions"},
    {href: "/transfers", label: "Transfers"},
    {href: "/budgets", label: "Budgets"},
    {href: "/insights", label: "Insights"},
];

export default function Sidebar() {
    const pathname = usePathname();
    return(
        <div className="h-full p-4">
            {/*logo*/}
            <div className="mb-6 flex items-center gap-3">
                <img
                    src="/moneymate-logo.png"
                    alt="MoneyMate logo"
                    className="h-10 w-10 rounded-md"
                />
                <div>
                    <div className="text-base font-semibold text-gray-900">MoneyMate</div>
                    <div className="text-xs text-gray-500">Personal Finance</div>
                </div>
            </div>
            {/*navigation*/}
            <nav className="space-y-1">
                {nav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return(
                        <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "text-gray-700 hover:bg-emerald-50"
                        )}
                        >
                            {item.label}
                        </Link>
                    );
                })}
                </nav>

        </div>
    );
}