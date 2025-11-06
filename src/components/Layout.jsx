import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen w-screen flex bg-[rgb(var(--bg))] text-[rgb(var(--fg))] overflow-hidden">

            {/* --- Sidebar --- */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* --- Main Content Area --- */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Wrapper */}
                <main className="flex-1 min-w-0 overflow-auto">
                {/* Shared page container for consistent spacing */}
                    <div className="container-pro py-6 md:py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* --- Mobile Backdrop when Sidebar open --- */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
