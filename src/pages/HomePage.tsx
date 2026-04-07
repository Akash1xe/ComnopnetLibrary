import { Link } from "react-router-dom";
import {
  RouteCTA,
  bodyClass,
  buttonOutline,
  buttonSecondary,
  buttonSolid,
  headingPill,
  h2Class,
  pageShell,
  panelClass,
  sectionHeading,
  stats,
} from "../site";

const marqueeItems = [
  "Button",
  "Card",
  "Modal",
  "Accordion",
  "Tabs",
  "Toast",
  "Tooltip",
  "Dropdown",
  "Sidebar",
  "Badge",
  "Avatar",
  "Input",
  "Slider",
  "Toggle",
  "Skeleton",
  "Command",
  "Calendar",
  "DataTable",
  "Combobox",
  "Dialog",
  "✦",
];

export function HomePage() {
  return (
    <main>
      <section className={`${pageShell} grid min-h-[calc(100vh-60px)] place-items-center pb-20 pt-12`}>
        <div className="absolute left-0 top-1/2 hidden w-[min(280px,30vw)] -translate-x-[10%] -translate-y-[42%] rotate-[-6deg] xl:block">
          <div className={`${panelClass} rounded-[16px] p-4 shadow-[0_20px_60px_rgba(0,212,255,0.08)]`}>
            <div className="mb-4 flex gap-1.5">
              <span className="size-2.5 rounded-full bg-border-default" />
              <span className="size-2.5 rounded-full bg-border-default" />
              <span className="size-2.5 rounded-full bg-border-default" />
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
                  Button
                </span>
                <button className="rounded-[6px] border border-border-default bg-white/2 px-3 py-1.5 text-sm transition hover:border-border-strong hover:bg-white/6">
                  Copy
                </button>
              </div>
              <div className="grid gap-3">
                <button className={buttonSecondary} type="button">
                  Deploy System
                </button>
                <button className={`${buttonOutline} justify-center bg-white/4`} type="button">
                  <span className="size-3 rounded-full border-2 border-white/30 border-t-white animate-spin-soft" />
                  Publishing
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-[2] grid max-w-[760px] justify-items-center gap-5 text-center">
          <div className={headingPill}>✦ Now in v2.0 — 100+ components</div>
          <h1 className="m-0 max-w-[12ch] font-display text-[clamp(3.5rem,7vw,4.5rem)] leading-[1.05] tracking-[-0.04em] text-text-primary">
            Build Interfaces That Feel Alive.
          </h1>
          <p className="m-0 max-w-[520px] text-lg leading-[1.7] text-text-secondary">
            Production-ready animated components for React and Next.js. Copy the code.
            Customize the style. Ship in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 max-md:flex-col max-md:items-stretch">
            <Link className={buttonSolid} to="/docs">
              Browse Components
            </Link>
            <Link className={buttonOutline} to="/brand">
              View Brand System
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[0.9rem] text-text-secondary max-md:flex-col max-md:items-stretch">
            <span>Trusted by 12,000+ developers</span>
            <div className="flex" aria-hidden="true">
              {["AL", "MK", "JR", "ZI", "NP"].map((avatar) => (
                <div
                  key={avatar}
                  className="-ml-1.5 grid size-8 place-items-center rounded-full border border-border-default bg-[linear-gradient(135deg,#171717,#232323)] text-[0.7rem] first:ml-0"
                >
                  {avatar}
                </div>
              ))}
            </div>
            <span className="text-text-primary">★★★★★ 4.9/5</span>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 hidden w-[min(280px,30vw)] translate-x-[10%] -translate-y-[38%] rotate-[4deg] xl:block">
          <div className={`${panelClass} rounded-[16px] p-4 shadow-[0_20px_60px_rgba(0,212,255,0.08)]`}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
                App/Cta.tsx
              </span>
              <span className="inline-flex rounded-full border border-[rgba(0,212,255,0.28)] bg-bg-card px-3 py-1 text-xs text-accent-cyan">
                Live
              </span>
            </div>
            <pre className="overflow-hidden rounded-[12px] bg-[#0d0d0d] p-4 font-mono text-sm leading-[1.65] text-text-primary">
              <code>
                <span className="text-accent-cyan">import</span> {"{"} Button {"}"}{" "}
                <span className="text-accent-cyan">from</span>{" "}
                <span className="text-accent-purple">"@/components/ui/button"</span>
                {"\n\n"}
                <span className="text-accent-cyan">export function</span> HeroAction() {"{"}
                {"\n  "}
                <span className="text-accent-cyan">return</span> (
                {"\n    "}&lt;<span className="text-text-primary">Button</span> variant=
                <span className="text-accent-purple">"primary"</span>&gt;
                {"\n      "}Browse Components{"\n    "}
                &lt;/<span className="text-text-primary">Button</span>&gt;
                {"\n  "}){"\n"}
                {"}"}
              </code>
            </pre>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <span className="block size-4 rotate-45 border-b border-r border-[#444] animate-bounce-soft" />
        </div>
      </section>

      <section className="relative z-[1] h-12 overflow-hidden border-y border-border-subtle bg-[#0d0d0d] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((index) => (
            <div key={index} className="flex items-center gap-[1.1rem] pr-[1.1rem]">
              {marqueeItems.map((item) => (
                <span
                  key={`${index}-${item}`}
                  className="font-mono text-xs leading-[48px] text-text-muted transition hover:text-accent-cyan"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className={`${pageShell} pt-12`}>
        <div className="grid border-t border-white/2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`grid justify-items-center gap-2 p-4 text-center ${
                index < stats.length - 1 ? "md:border-r md:border-border-subtle" : ""
              }`}
            >
              <strong className="m-0 font-display text-4xl tracking-[-0.04em]">{stat.value}</strong>
              <span className="text-[13px] text-[#666]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={pageShell}>
        <div className={sectionHeading}>
          <span className={headingPill}>Explore the system</span>
          <h2 className={h2Class}>A multi-page frontend built around the same premium design system.</h2>
          <p className={bodyClass}>
            Move between the landing experience, the brand identity guide, the docs surface,
            and the pricing stack as separate screens instead of a single scrolling page.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "01",
              "Brand Identity",
              "Logo concepts, swatches, typography, tokens, and component state references.",
              "/brand",
            ],
            [
              "02",
              "Documentation",
              "Sidebar navigation, code blocks, examples, and API references for components.",
              "/docs",
            ],
            [
              "03",
              "Pricing",
              "Premium plan presentation, team positioning, social proof, and FAQ content.",
              "/pricing",
            ],
          ].map(([index, title, description, href]) => (
            <Link
              key={title}
              className={`${panelClass} grid gap-3 rounded-[16px] p-6 transition hover:-translate-y-0.5 hover:border-border-strong`}
              to={href}
            >
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
                {index}
              </span>
              <strong className="text-[1.15rem]">{title}</strong>
              <p className={bodyClass}>{description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <RouteCTA to="/brand">Open Brand Page</RouteCTA>
        </div>
      </section>
    </main>
  );
}
