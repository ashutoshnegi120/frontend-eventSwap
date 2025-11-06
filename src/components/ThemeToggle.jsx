import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Modern Theme Toggle (C-SASSY)
 * - Smooth icon transition
 * - Saves theme to localStorage
 * - Applies theme via data-theme attribute
 */

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    // Apply theme to <html> on change
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <button
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            className="btn-ghost fixed right-4 bottom-4 z-50 p-2 rounded-full shadow-sm hover:shadow-md transition-all backdrop-blur-md bg-black/5 dark:bg-white/10"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {/* Icon Transition */}
            <div className="relative w-6 h-6 flex items-center justify-center">
                <Sun
                    className={`absolute w-5 h-5 text-yellow-500 transition-all duration-300 ${
                        theme === "dark" ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
                    }`}
                />
                <Moon
                    className={`absolute w-5 h-5 text-blue-500 transition-all duration-300 ${
                        theme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
                    }`}
                />
            </div>
        </button>
    );
}
