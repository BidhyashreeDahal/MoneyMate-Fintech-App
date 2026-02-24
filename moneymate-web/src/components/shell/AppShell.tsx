"use client";
/**
 * App layout
 * ------------------------------------------------------
 * The "bank frame" every logged-in page lives inside.
 * Sidebar navigation, top bar, main content.
 * A11y: skip link, landmarks (banner, complementary, main).
 **/
import Sidebar from "./SideBar";
import Topbar from "./TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
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
        {/* Sidebar — complementary landmark */}
        <aside
          className="w-64 border-r border-emerald-100 bg-white/90 backdrop-blur sticky top-0 h-screen"
          aria-label="Primary navigation"
        >
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <header
            className="border-b border-emerald-100 bg-white/90 backdrop-blur sticky top-0 z-10"
            role="banner"
          >
            <Topbar />
          </header>
          <main id="main-content" className="flex-1 p-6" role="main">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}