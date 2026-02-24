"use client";
/**
 * App layout
 * ------------------------------------------------------
 * The "bank frame" every logged-in page lives inside.
 * Sidebar navigation, top bar, main content.
 * A11y: skip link, landmarks (banner, complementary, main).
 * Responsive: collapses sidebar into a mobile drawer on small screens.
 **/
import { useState } from "react";
import Sidebar from "./SideBar";
import Topbar from "./TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="w-64 border-r border-emerald-100 bg-white shadow-xl">
              <Sidebar />
            </div>
            <button
              aria-label="Close navigation menu"
              className="flex-1 bg-black/40"
              onClick={() => setMobileNavOpen(false)}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <header
            className="border-b border-emerald-100 bg-white/90 backdrop-blur sticky top-0 z-30"
            role="banner"
          >
            <div className="flex items-center gap-3 px-3 md:px-4">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-emerald-100 bg-white text-emerald-700 shadow-sm h-9 w-9 md:hidden"
                aria-label="Open navigation menu"
                onClick={() => setMobileNavOpen(true)}
              >
                <span className="block w-4 h-[2px] bg-emerald-700 rounded-sm" />
                <span className="block w-4 h-[2px] bg-emerald-700 rounded-sm mt-1" />
                <span className="block w-4 h-[2px] bg-emerald-700 rounded-sm mt-1" />
              </button>
              <div className="flex-1">
                <Topbar />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 p-4 sm:p-6" role="main">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}