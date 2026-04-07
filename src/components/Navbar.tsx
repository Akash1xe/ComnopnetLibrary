import { Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { initials } from "../lib/utils";
import { GitHubIcon, LogoMark, buttonSecondary, iconButton } from "../site";

const links = [
  { to: "/", label: "Home" },
  { to: "/components", label: "Components" },
  { to: "/brand", label: "Brand" },
  { to: "/docs", label: "Docs" },
  { to: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoggedIn, clearAuth } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-black/70 backdrop-blur-[12px]">
      <div className="mx-auto flex h-[60px] w-[min(1200px,calc(100%-2rem))] items-center justify-between gap-4 max-md:w-[min(100%-1rem,100%)]">
        <Link to="/" className="inline-flex items-center gap-3 font-semibold tracking-[0.04em]">
          <LogoMark className="w-6 text-text-primary" />
          <span>[YourBrandName]</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="text-sm text-text-secondary transition hover:text-text-primary">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <button className={iconButton} type="button">
                <Bell className="h-4 w-4" />
              </button>
              <div className="relative">
                <button
                  className="inline-flex items-center gap-3 rounded-[6px] border border-border-default bg-white/2 px-3 py-2"
                  onClick={() => setOpen((value) => !value)}
                  type="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-[linear-gradient(135deg,#171717,#232323)] text-sm font-semibold text-accent-cyan">
                    {initials(user?.full_name, user?.email)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-text-primary">{user?.full_name ?? user?.username}</p>
                    <p className="text-xs text-accent-cyan">{user?.subscription_tier?.toUpperCase()}</p>
                  </div>
                </button>
                {open ? (
                  <div className="panel-surface absolute right-0 mt-3 w-56 rounded-[16px] p-2">
                    {[
                      ["/dashboard", "My Dashboard"],
                      ["/dashboard/collections", "Collections"],
                      ["/dashboard/billing", "Billing"],
                      ["/dashboard/settings", "Settings"],
                    ].map(([to, label]) => (
                      <Link
                        key={to}
                        to={to}
                        className="block rounded-[10px] px-4 py-3 text-sm text-text-secondary transition hover:bg-white/6 hover:text-text-primary"
                        onClick={() => setOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="my-2 border-t border-border-subtle" />
                    <button
                      className="block w-full rounded-[10px] px-4 py-3 text-left text-sm text-error transition hover:bg-white/6"
                      onClick={() => clearAuth()}
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <button className={iconButton} type="button" aria-label="GitHub">
                <GitHubIcon />
              </button>
              <Link to="/login" className="text-sm text-text-secondary transition hover:text-text-primary">
                Login
              </Link>
              <Link to="/register">
                <span className={buttonSecondary}>Get Started</span>
              </Link>
            </>
          )}
        </div>

        <button className={`md:hidden ${iconButton}`} onClick={() => setMenuOpen((v) => !v)} type="button">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen ? (
        <div className="border-t border-border-subtle px-4 py-4 md:hidden">
          <div className="space-y-3">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className="block text-sm text-text-secondary" onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
