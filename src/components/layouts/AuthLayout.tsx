import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark, bodyClass, headingPill, pageShell, panelClass } from "../../site";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(26,26,26,0.85)_1px,transparent_1px)] bg-[length:30px_30px] opacity-[0.08]" />
      <div className="pointer-events-none absolute left-[-8rem] top-12 h-[400px] w-[400px] rounded-full bg-[rgba(0,212,255,0.12)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-8rem] top-24 h-[360px] w-[360px] rounded-full bg-[rgba(168,85,247,0.08)] blur-[120px]" />
      <div className={`${pageShell} relative z-10 flex min-h-[calc(100vh-6rem)] items-center justify-center py-0`}>
        <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="w-10 text-text-primary" />
          <div>
            <span className={headingPill}>Authentication</span>
            <p className="mt-3 text-sm uppercase tracking-[0.3em] text-accent-cyan">[YourBrandName]</p>
            <p className="mt-1 text-xs text-text-secondary">Ship polished UI faster</p>
          </div>
        </Link>

        <div className={`${panelClass} rounded-[16px] p-8`}>
          <h1 className="font-display text-4xl tracking-[-0.04em] text-text-primary">{title}</h1>
          {subtitle ? <p className={`${bodyClass} mt-2 text-sm`}>{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
