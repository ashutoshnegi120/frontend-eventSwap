import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Modern SaaS Navbar
 * - Uses theme tokens
 * - Mobile & Desktop friendly
 * - Clean user avatar + info + logout
 */
export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
      <nav className="sticky top-0 z-20 bg-[rgb(var(--card))] border-b border-black/10 dark:border-white/10 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">

        {/* Mobile Menu Button */}
        <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <Menu className="w-6 h-6 text-[rgb(var(--fg))]" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>

            {/* User Info */}
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-[rgb(var(--fg))]">
                {user?.username}
              </p>
              <p className="text-xs text-[rgb(var(--muted))]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
              onClick={handleLogout}
              className="btn-ghost p-2 rounded-lg text-[rgb(var(--muted))] hover:text-red-600 transition"
              title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>
  );
}
