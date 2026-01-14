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
            <div className="mb-6 text-lg font-semibold text-indigo-600">MoneyMate</div>
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
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-700 hover:bg-gray-100"
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