import { Link, useLocation } from "react-router-dom";
import { Calendar, ShoppingBag, Mail, LayoutDashboard, X } from "lucide-react";
import { useNotify } from "../context/NotifyContext";

/**
 * Modern SaaS Sidebar
 * - Smooth slide-in for mobile
 * - Active states with brand highlight
 * - Notification badge for requests
 */
export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { unreadRequests } = useNotify();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "My Calendar", icon: Calendar },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/requests", label: "Requests", icon: Mail, badge: unreadRequests },
  ];

  const isActive = (href) => location.pathname === href;

  return (
      <>
        {/* Mobile overlay */}
        {open && (
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                onClick={onClose}
            />
        )}

        {/* Sidebar Panel */}
        <aside
            className={`
          fixed md:relative z-50 
          w-64 h-screen flex flex-col 
          bg-[rgb(var(--card))] text-[rgb(var(--fg))]
          border-r border-black/10 dark:border-white/10
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        >
          {/* Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
            <h1 className="text-xl font-semibold tracking-tight">SlotSwapper</h1>

            {/* Close (Mobile Only) */}
            <button
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map(({ href, label, icon: Icon, badge }) => {
              const active = isActive(href);

              return (
                  <Link
                      key={href}
                      to={href}
                      onClick={onClose}
                      className={`
                  flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${active
                          ? "bg-[rgb(var(--brand-600))] text-white shadow-sm"
                          : "text-[rgb(var(--muted))] hover:bg-black/5 dark:hover:bg-white/10"
                      }
                `}
                  >
                <span className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-[rgb(var(--muted))]"}`} />
                  {label}
                </span>

                    {/* Badge */}
                    {badge > 0 && (
                        <span className="min-w-[20px] h-5 px-2 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold">
                    {badge}
                  </span>
                    )}
                  </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-black/10 dark:border-white/10 text-[rgb(var(--muted))] text-xs">
            v0.1.0
          </div>
        </aside>
      </>
  );
}
