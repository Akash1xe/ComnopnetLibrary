import { Bookmark, CreditCard, LayoutDashboard, LogOut, Moon, Settings, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { initials } from "../../lib/utils";
import { LogoMark, pageShell, panelClass } from "../../site";
import { useThemeStore } from "../../stores/themeStore";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/collections", label: "Collections", icon: Bookmark },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, clearAuth } = useAuth();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] flex-col border-r border-border-subtle bg-black/70 p-5 backdrop-blur-[12px] lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark className="w-8 text-text-primary" />
          <div>
            <p className="text-sm font-semibold">[YourBrandName]</p>
            <p className="text-xs text-text-secondary">Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm transition ${
                    isActive ? "border border-border-default bg-white/6 text-text-primary" : "text-text-secondary hover:bg-white/4 hover:text-text-primary"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          className="mt-auto mb-4 flex items-center gap-3 rounded-[10px] border border-border-default px-4 py-3 text-sm text-text-secondary transition hover:bg-white/6"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Toggle theme
        </button>

        <div className={`${panelClass} rounded-[16px] p-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-[linear-gradient(135deg,#171717,#232323)] text-sm font-semibold text-accent-cyan">
              {initials(user?.full_name, user?.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.full_name ?? user?.username}</p>
              <p className="truncate text-xs text-text-secondary">{user?.subscription_tier?.toUpperCase()}</p>
            </div>
          </div>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] border border-border-default px-4 py-3 text-sm text-text-secondary transition hover:bg-white/6"
            onClick={() => clearAuth()}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="px-4 py-6 lg:ml-[220px]">
        <div className={`${pageShell} max-w-5xl pb-20 pt-6 lg:pb-0`}>{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border-subtle bg-black/90 px-2 py-2 backdrop-blur lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-[10px] px-3 py-2 text-[11px] ${
                  isActive ? "text-accent-cyan" : "text-text-secondary"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
