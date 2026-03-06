"use client";
/**
 * App layout
 * ------------------------------------------------------
 * The "bank frame" every logged-in page lives inside.
 * Sidebar navigation, top bar, main content.
 * A11y: skip link, landmarks (banner, complementary, main).
 * Responsive: collapses sidebar into a mobile drawer on small screens.
 **/
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "./SideBar";
import Topbar from "./TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 text-gray-900">
      {/* Skip link: first focusable for keyboard/screen reader */}
      <a
        href="#main-content"
        className="absolute left-[-9999px] w-px h-px overflow-hidden focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:overflow-visible focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:block w-64 border-r border-emerald-100 bg-white/90 backdrop-blur sticky top-0 h-screen"
          aria-label="Primary navigation"
        >
          <Sidebar />
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="w-[min(280px,85vw)] max-w-full border-r border-emerald-100 bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-emerald-100">
                <span className="text-sm font-semibold text-gray-700">Menu</span>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-emerald-50 text-gray-600"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar />
              </div>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              className="flex-1 bg-black/40 min-h-[44px]"
              onClick={() => setMobileNavOpen(false)}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="border-b border-emerald-100 bg-white/90 backdrop-blur sticky top-0 z-30"
            role="banner"
          >
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-700 shadow-sm h-11 w-11 min-w-[44px] min-h-[44px] md:hidden touch-manipulation"
                aria-label="Open navigation menu"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <Topbar />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 p-3 sm:p-6" role="main">
            <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}