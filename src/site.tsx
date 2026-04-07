import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type Stat = {
  value: string;
  label: string;
};

export type Swatch = {
  name: string;
  value: string;
};

export type TokenGroup = {
  title: string;
  items: string[];
};

export type DocSection = {
  heading: string;
  items: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const pageShell = "relative z-[1] mx-auto w-[min(1200px,calc(100%-2rem))] py-24 max-md:w-[min(100%-1rem,100%)]";
export const sectionHeading = "mb-8 grid max-w-[760px] gap-4";
export const headingPill =
  "inline-flex w-fit items-center gap-2 rounded-full border border-border-default bg-bg-card px-3.5 py-1.5 text-xs text-text-secondary";
export const monoPill = `${headingPill} font-mono uppercase tracking-[0.08em] text-text-muted`;
export const h2Class =
  "m-0 font-display text-[clamp(2.5rem,5vw,3rem)] leading-[1.05] tracking-[-0.04em] text-text-primary";
export const bodyClass = "m-0 text-text-secondary leading-[1.7]";
export const panelClass = "panel-surface rounded-[16px] p-6";
export const cardClass = "rounded-[12px] border border-border-subtle bg-white/3";
export const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border px-5 py-3 font-semibold transition duration-200 ease-out focus-visible:focus-ring";
export const buttonSolid = `${buttonBase} border-transparent bg-accent-cyan text-black shadow-glow-cyan hover:-translate-y-px hover:bg-[#6ce7ff] active:scale-[0.98]`;
export const buttonOutline = `${buttonBase} border-border-default bg-transparent text-text-primary hover:-translate-y-px hover:bg-white/8 active:scale-[0.98]`;
export const buttonSecondary = `${buttonBase} border-accent-cyan bg-black text-accent-cyan hover:-translate-y-px hover:bg-white/8 active:scale-[0.98]`;
export const iconButton =
  "inline-grid size-10 place-items-center rounded-[6px] border border-border-default bg-white/2 text-text-secondary transition hover:border-border-strong hover:bg-white/6";

export const stats: Stat[] = [
  { value: "100+", label: "Components available" },
  { value: "12k+", label: "Developers using it" },
  { value: "Next.js 14", label: "Fully compatible" },
  { value: "MIT", label: "Open source license" },
];

export const colors: Swatch[] = [
  { name: "Black", value: "#080808" },
  { name: "Surface", value: "#111111" },
  { name: "Border", value: "#1e1e1e" },
  { name: "Muted", value: "#888888" },
  { name: "White", value: "#f5f5f5" },
  { name: "Cyan", value: "#00d4ff" },
  { name: "Purple", value: "#a855f7" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
];

export const tokenGroups: TokenGroup[] = [
  {
    title: "Color tokens",
    items: [
      "--color-bg-base: #080808",
      "--color-bg-surface: #0f0f0f",
      "--color-bg-elevated: #141414",
      "--color-bg-card: #111111",
      "--color-border-default: #2a2a2a",
      "--color-text-primary: #f5f5f5",
      "--color-accent-cyan: #00d4ff",
      "--color-accent-purple: #a855f7",
    ],
  },
  {
    title: "Spacing",
    items: ["4", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80", "96"],
  },
  {
    title: "Radius",
    items: [
      "--radius-sm: 4px",
      "--radius-md: 6px",
      "--radius-lg: 12px",
      "--radius-xl: 16px",
      "--radius-full: 9999px",
    ],
  },
  {
    title: "Motion",
    items: [
      "Fast: 100ms ease",
      "Default: 200ms ease",
      "Slow: 350ms ease",
      "Spring: cubic-bezier(0.34, 1.56, 0.64, 1)",
    ],
  },
];

export const docSections: DocSection[] = [
  { heading: "Getting Started", items: ["Installation", "Theming", "Dark Mode", "CLI"] },
  {
    heading: "Components",
    items: ["Button", "Card", "Dialog", "Toast", "Tabs", "Accordion", "Input", "Avatar", "Command"],
  },
  { heading: "Hooks", items: ["useTheme", "useMediaQuery", "useClipboard"] },
  { heading: "Utilities", items: ["cn()", "createTheme"] },
];

export const faqs: FaqItem[] = [
  {
    question: "Can I use this in commercial projects?",
    answer: "Yes. The free tier supports MIT-licensed usage and paid plans extend templates, support, and team-level access.",
  },
  {
    question: "Does it support React and Next.js App Router?",
    answer: "The system is designed for React and Next.js developers, including modern app-directory workflows and server/client composition.",
  },
  {
    question: "Are the components accessible?",
    answer: "Every showcased primitive is designed around keyboard navigation, visible focus states, strong contrast, and motion restraint.",
  },
  {
    question: "How customizable is the design system?",
    answer: "Tokens are exposed for color, radius, spacing, typography, elevation, and animation so teams can re-skin quickly without rewriting patterns.",
  },
  {
    question: "Will more components be added?",
    answer: "Yes. The changelog and early access lanes are structured around steady component additions, templates, and polished motion patterns.",
  },
];

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 22L31 14L48 22L33 30L16 22Z" fill="currentColor" />
      <path d="M16 41L31 33V50L16 41Z" fill="currentColor" opacity="0.88" />
      <path d="M48 41L33 33V50L48 41Z" fill="var(--color-accent-purple)" />
    </svg>
  );
}

export function MonogramLogo() {
  return (
    <div className="grid grid-flow-col gap-1 border border-border-default px-4 py-3 font-display text-[2rem] font-extrabold tracking-[0.02em] text-accent-cyan">
      <span>Y</span>
      <span>B</span>
    </div>
  );
}

export function WordmarkLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-3 font-medium tracking-[0.04em] ${
        compact ? "origin-left scale-[0.92]" : ""
      }`}
    >
      <LogoMark className="w-6 text-text-primary" />
      <span>[YourBrandName]</span>
    </div>
  );
}

export function LogoCard({
  title,
  subtitle,
  logo,
}: {
  title: string;
  subtitle: string;
  logo: ReactNode;
}) {
  return (
    <div className={`${cardClass} grid gap-3 p-4`}>
      <div className="grid min-h-40 place-items-center rounded-[12px] bg-[#0b0b0b] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent)]">
        {logo}
      </div>
      <strong className="font-semibold">{title}</strong>
      <span className="text-sm text-text-secondary">{subtitle}</span>
    </div>
  );
}

export function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="w-[18px]">
      <path
        d="M12 3C7.03 3 3 7.03 3 12C3 15.98 5.58 19.35 9.16 20.54C9.61 20.62 9.77 20.35 9.77 20.12V18.51C7.27 19.05 6.74 17.44 6.74 17.44C6.33 16.39 5.73 16.12 5.73 16.12C4.9 15.55 5.8 15.56 5.8 15.56C6.71 15.62 7.18 16.49 7.18 16.49C8 17.88 9.34 17.48 9.85 17.24C9.93 16.65 10.17 16.25 10.44 16.02C8.44 15.8 6.34 15.02 6.34 11.55C6.34 10.56 6.69 9.76 7.26 9.13C7.17 8.9 6.86 7.97 7.34 6.72C7.34 6.72 8.1 6.48 9.76 7.59C10.5 7.39 11.29 7.29 12.08 7.29C12.87 7.29 13.66 7.39 14.4 7.59C16.06 6.48 16.82 6.72 16.82 6.72C17.3 7.97 16.99 8.9 16.9 9.13C17.47 9.76 17.82 10.56 17.82 11.55C17.82 15.03 15.71 15.79 13.71 16.01C14.06 16.31 14.37 16.9 14.37 17.81V20.12C14.37 20.35 14.53 20.63 14.99 20.54C18.56 19.35 21.14 15.98 21.14 12C21.14 7.03 17.11 3 12.14 3H12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function PricingCard({
  name,
  price,
  suffix,
  tagline,
  features,
  cta,
  featured = false,
}: {
  name: string;
  price: string;
  suffix: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`${panelClass} grid gap-4 rounded-[16px] p-8 ${
        featured ? "border-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.15)]" : ""
      }`}
    >
      {featured ? (
        <span className="mx-auto inline-flex w-fit rounded-full bg-[#001f26] px-3 py-1 font-mono text-[11px] text-accent-cyan">
          Most Popular
        </span>
      ) : null}
      <span className="font-mono text-text-primary">{name}</span>
      <div className="flex items-end gap-2">
        <strong className="m-0 font-display text-5xl tracking-[-0.04em]">{price}</strong>
        <span className="text-lg text-text-muted">{suffix}</span>
      </div>
      <p className={bodyClass}>{tagline}</p>
      <ul className="m-0 list-none p-0 text-sm">
        {features.map((feature) => (
          <li
            key={feature}
            className={`py-1.5 text-text-secondary ${
              feature.startsWith("✗") ? "text-text-disabled line-through" : ""
            }`}
          >
            {feature}
          </li>
        ))}
      </ul>
      <button className={featured ? buttonSolid : buttonOutline} type="button">
        {cta}
      </button>
    </article>
  );
}

export function RouteCTA({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className={buttonOutline} to={to}>
      {children}
    </Link>
  );
}
