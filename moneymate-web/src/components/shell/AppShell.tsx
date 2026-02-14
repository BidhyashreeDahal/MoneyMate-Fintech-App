"use client";
/**
 * App layout
 * ------------------------------------------------------
 * The "bank frame" every logged-in page lives inside.
 * Sidebar navigation
 * Top nav bar
 * Main content container with consistent spacing
 **/
import Sidebar from "./SideBar";
import Topbar from "./TopBar";

export default function AppShell ({children} : {children: React.ReactNode}) {
    return(
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 text-gray-900">
            <div className ="flex min-h-screen">
                {/*Sidebar */}
                <aside className="w-64 border-r border-emerald-100 bg-white/90 backdrop-blur">
                    <Sidebar />
                </aside>
                {/* Main content area */}
                <div className="flex-1 flex flex-col">
                    {/* Topbar */}
                    <header className="border-b border-emerald-100 bg-white/90 backdrop-blur sticky top-0 z-10">
                        <Topbar />
                    </header>
                    {/* Content */}
                    <main className="flex-1 p-6"> 
                      <div className="mx-auto w-full max-w-6xl">{children} </div>
                    </main>
                </div>      
            </div>
        </div>
       
    );  
}