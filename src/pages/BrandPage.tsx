import {
  LogoCard,
  LogoMark,
  MonogramLogo,
  RouteCTA,
  WordmarkLogo,
  bodyClass,
  buttonSecondary,
  buttonSolid,
  colors,
  h2Class,
  headingPill,
  pageShell,
  panelClass,
  sectionHeading,
  tokenGroups,
} from "../site";

export function BrandPage() {
  return (
    <main className={`${pageShell} min-h-[calc(100vh-60px)]`}>
      <div className={sectionHeading}>
        <span className={headingPill}>Brand Identity</span>
        <h2 className={h2Class}>Premium, technical, dark-first foundations for [YourBrandName].</h2>
        <p className={bodyClass}>
          A cohesive style-guide surface covering logo directions, colors, typography,
          states, cards, and token references for implementation or handoff.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className={`${panelClass} rounded-[16px] p-6 lg:col-span-2`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
              Logo Concepts
            </span>
            <span className="text-xs text-text-secondary">3 variations · 512 / 200x40 / 16</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <LogoCard
              title="Geometric abstract mark"
              subtitle="Interlocking modular facets"
              logo={<LogoMark className="w-[72px] text-text-primary" />}
            />
            <LogoCard
              title="Letter monogram"
              subtitle="Angular YB-inspired lockup"
              logo={<MonogramLogo />}
            />
            <LogoCard
              title="Icon + wordmark"
              subtitle="Primary horizontal system"
              logo={<WordmarkLogo />}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="grid min-h-[110px] place-items-center gap-3 rounded-[12px] border border-border-subtle bg-white/2">
              <span className="inline-flex rounded-full border border-border-default bg-bg-card px-3 py-1 text-xs text-text-secondary">
                512 × 512
              </span>
              <LogoMark className="w-14 text-text-primary" />
            </div>
            <div className="grid min-h-[110px] place-items-center gap-3 rounded-[12px] border border-border-subtle bg-white/2">
              <span className="inline-flex rounded-full border border-border-default bg-bg-card px-3 py-1 text-xs text-text-secondary">
                200 × 40
              </span>
              <WordmarkLogo compact />
            </div>
            <div className="grid min-h-[110px] place-items-center gap-3 rounded-[12px] border border-border-subtle bg-white/2">
              <span className="inline-flex rounded-full border border-border-default bg-bg-card px-3 py-1 text-xs text-text-secondary">
                16 × 16
              </span>
              <LogoMark className="w-[18px] text-text-primary" />
            </div>
          </div>
        </article>

        <article className={`${panelClass} rounded-[16px] p-6`}>
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
            Color Swatches
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {colors.map((color) => (
              <div key={color.name} className="grid gap-2 rounded-[12px] border border-border-subtle bg-white/2 p-4">
                <span
                  className="block h-13 w-full rounded-[6px] border border-white/6"
                  style={{ background: color.value }}
                />
                <strong className="font-semibold">{color.name}</strong>
                <small className="text-sm text-text-secondary">{color.value}</small>
              </div>
            ))}
          </div>
        </article>

        <article className={`${panelClass} rounded-[16px] p-6`}>
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
            Typography Scale
          </div>
          <div className="grid gap-3">
            <span className="font-mono text-[11px]">11px / JetBrains Mono / xs</span>
            <span className="text-[13px]">13px / DM Sans / sm</span>
            <span className="text-[14px]">14px / DM Sans / base</span>
            <span className="text-[16px]">16px / DM Sans / md</span>
            <span className="text-[18px]">18px / DM Sans / lg</span>
            <span className="text-[22px]">22px / DM Sans / xl</span>
            <span className="font-display text-[30px] tracking-[-0.04em]">30px / Syne / 2xl</span>
            <span className="font-display text-[40px] tracking-[-0.04em]">40px / Syne / 3xl</span>
            <span className="font-display text-[56px] tracking-[-0.04em]">56px / Syne / 4xl</span>
            <span className="font-display text-[64px] tracking-[-0.04em]">64px / Syne / 5xl preview</span>
          </div>
        </article>

        <article className={`${panelClass} rounded-[16px] p-6 lg:col-span-2`}>
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
            Component States
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid gap-4">
              <h3 className="font-semibold">Buttons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className={buttonSecondary} type="button">
                  Default
                </button>
                <button className={buttonSolid} type="button">
                  Hover
                </button>
                <button className={`${buttonSolid} scale-[0.98]`} type="button">
                  Active
                </button>
                <button
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-[6px] border border-accent-cyan bg-black px-5 py-3 font-semibold text-accent-cyan opacity-40"
                  type="button"
                  disabled
                >
                  Disabled
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <h3 className="font-semibold">Inputs</h3>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm">Default</label>
                  <input
                    className="min-h-11 rounded-[6px] border border-border-default bg-black px-4 text-text-primary focus-visible:focus-ring"
                    placeholder="Email address"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm">Focused</label>
                  <input
                    className="min-h-11 rounded-[6px] border border-accent-cyan bg-black px-4 text-text-primary shadow-glow-cyan focus-visible:focus-ring"
                    defaultValue="starter-kit"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm">Error</label>
                  <input
                    className="min-h-11 rounded-[6px] border border-error bg-black px-4 text-text-primary focus-visible:focus-ring"
                    defaultValue="Missing token"
                  />
                  <small className="text-error">Component name is already in use.</small>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="font-semibold">Cards</h3>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="grid min-h-28 place-items-center rounded-[12px] border border-border-subtle bg-white/3">
                  Default
                </div>
                <div className="grid min-h-28 place-items-center rounded-[12px] border border-border-subtle bg-white/3 shadow-glow-cyan">
                  Hover
                </div>
                <div className="grid min-h-28 place-items-center rounded-[12px] border border-accent-cyan/40 bg-[linear-gradient(180deg,rgba(0,212,255,0.1),rgba(255,255,255,0.02))]">
                  Highlighted
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className={`${panelClass} rounded-[16px] p-6 lg:col-span-2`}>
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
            Design Tokens
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tokenGroups.map((group) => (
              <div key={group.title} className="rounded-[12px] border border-border-subtle bg-white/2 p-4">
                <h3 className="mb-3 font-semibold">{group.title}</h3>
                <ul className="m-0 list-none p-0">
                  {group.items.map((item) => (
                    <li key={item} className="py-1.5 text-sm text-text-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-8 flex justify-end">
        <RouteCTA to="/docs">See Docs Layout</RouteCTA>
      </div>
    </main>
  );
}
