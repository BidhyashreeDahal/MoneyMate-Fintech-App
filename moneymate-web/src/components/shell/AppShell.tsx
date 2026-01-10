"use clent";
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
        <div style={{display: "flex", minHeight: "100vh"}}>
            <Sidebar />
            <div style ={{flex:1}}>
                <Topbar />
                <main style ={{padding: 24, maxWidth: 1100, margin: "0 auto"}}>
                    {children}
                </main>
            </div>
        </div>
    );  
}