import { BarChart3, LayoutDashboard, Settings, Shapes, Users } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LogoMark, pageShell } from "../../site";

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/components", label: "Components", icon: Shapes },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-border-subtle bg-black/70 p-6 backdrop-blur-[12px] lg:block">
        <div className="mb-8">
          <LogoMark className="mb-5 w-8 text-text-primary" />
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
            Admin Panel
          </span>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm ${
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
      </aside>
      <main className="px-4 py-6 lg:ml-[240px]">
        <div className={`${pageShell} max-w-6xl pt-6`}>{children}</div>
      </main>
    </div>
  );
}
