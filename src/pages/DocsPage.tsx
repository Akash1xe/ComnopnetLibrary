import { docSections, bodyClass, buttonSecondary, headingPill, h2Class, pageShell, panelClass, sectionHeading } from "../site";

export function DocsPage() {
  return (
    <main className={`${pageShell} min-h-[calc(100vh-60px)]`}>
      <div className={sectionHeading}>
        <span className={headingPill}>Docs Layout</span>
        <h2 className={h2Class}>Reference documentation built for scanning, copying, and shipping.</h2>
        <p className={bodyClass}>Styled like a premium docs shell with strong structure and sharp visual rhythm.</p>
      </div>

      <div className={`${panelClass} grid overflow-hidden rounded-[20px] lg:grid-cols-[240px_minmax(0,1fr)_200px]`}>
        <aside className="border-b border-border-subtle bg-bg-base/95 p-6 lg:min-h-[900px] lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center justify-between gap-3 rounded-[6px] border border-border-default bg-bg-card px-4 py-3 text-sm text-text-secondary">
            <span>Search components...</span>
            <kbd className="rounded-[4px] border border-border-default bg-white/2 px-1.5 py-0.5 font-mono text-xs">cmd+K</kbd>
          </div>
          {docSections.map((section) => (
            <div key={section.heading} className="mt-4 first:mt-0">
              <span className="mb-2 inline-block font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
                {section.heading}
              </span>
              <ul className="m-0 list-none p-0">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className={`border-l-2 pl-3 ${
                      item === "Button"
                        ? "border-accent-cyan bg-[#0d0d0d]"
                        : "border-transparent"
                    }`}
                  >
                    <a
                      className={`block py-2 text-sm ${
                        item === "Button" ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                      }`}
                      href="#button-doc"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div className="min-w-0 p-6 lg:min-h-[900px] lg:p-12" id="button-doc">
          <span className="text-[13px] text-text-secondary">Components / Button</span>
          <h2 className="mt-2 font-display text-4xl tracking-[-0.04em] text-text-primary">Button</h2>
          <p className={`${bodyClass} mt-3`}>
            A flexible action primitive with refined hover, focus, and loading states for
            high-end application interfaces.
          </p>

          <div className="my-6 flex items-center gap-2">
            <button className="rounded-[6px] border border-white/20 bg-white/8 px-3 py-2 text-sm text-text-primary">
              CLI
            </button>
            <button className="rounded-[6px] border border-border-default bg-white/2 px-3 py-2 text-sm text-text-primary transition hover:border-border-strong hover:bg-white/6">
              Manual
            </button>
          </div>

          <div className="relative rounded-[12px] border border-border-subtle bg-[#0d0d0d] p-4">
            <button className="absolute right-4 top-4 rounded-[6px] border border-border-default bg-white/2 px-3 py-1.5 text-sm transition hover:border-border-strong hover:bg-white/6">
              Copy
            </button>
            <pre className="overflow-auto pr-16 font-mono text-sm leading-[1.65] text-text-primary">
              <code>
                pnpm dlx yourbrand-ui add button{"\n"}
                import {"{"} Button {"}"} from &quot;@/components/ui/button&quot;
              </code>
            </pre>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold">Usage</h3>
            <div className="mt-4 rounded-[12px] border border-border-subtle bg-[#0d0d0d] p-4">
              <pre className="overflow-auto font-mono text-sm leading-[1.65] text-text-primary">
                <code>
                  &lt;Button variant=&quot;primary&quot;&gt;Save changes&lt;/Button&gt;{"\n"}
                  &lt;Button variant=&quot;secondary&quot;&gt;Cancel&lt;/Button&gt;
                </code>
              </pre>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold">Examples</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["Primary", "Secondary", "Loading", "Icon Left"].map((item) => (
                <div key={item} className="rounded-[12px] border border-border-subtle bg-white/2 p-4">
                  <div className="mb-3 grid min-h-[140px] place-items-center rounded-[12px] border border-border-subtle bg-white/3">
                    <button className={buttonSecondary} type="button">
                      {item}
                    </button>
                  </div>
                  <button className="rounded-[6px] border border-border-default bg-white/2 px-3 py-1.5 text-sm transition hover:border-border-strong hover:bg-white/6">
                    Code
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold">API Reference</h3>
            <div className="mt-4 overflow-hidden rounded-[12px] border border-border-subtle">
              <div className="grid gap-4 bg-[#0a0a0a] px-4 py-3 text-sm md:grid-cols-[1fr_1.2fr_0.8fr_1.8fr]">
                <span>Property</span>
                <span>Type</span>
                <span>Default</span>
                <span>Description</span>
              </div>
              {[
                ["variant", '"primary" | "secondary"', '"primary"', "Visual treatment"],
                ["size", '"sm" | "md" | "lg"', '"md"', "Controls height and padding"],
                ["loading", "boolean", "false", "Shows spinner and locks interaction"],
                ["asChild", "boolean", "false", "Renders a slot-based child element"],
              ].map((row, index) => (
                <div
                  key={row[0]}
                  className={`grid gap-4 px-4 py-3 text-sm md:grid-cols-[1fr_1.2fr_0.8fr_1.8fr] ${
                    index % 2 === 1 ? "bg-white/[0.01]" : "bg-transparent"
                  }`}
                >
                  <span className="text-text-secondary">{row[0]}</span>
                  <span className="font-mono text-accent-cyan">{row[1]}</span>
                  <span className="text-text-secondary">{row[2]}</span>
                  <span className="text-text-secondary">{row[3]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="hidden border-l border-border-subtle p-6 lg:block lg:min-h-[900px]">
          <span className="mb-2 inline-block font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
            On this page
          </span>
          <ul className="m-0 list-none p-0">
            <li className="py-2 text-sm text-text-primary">Introduction</li>
            <li className="py-2 text-sm text-text-secondary hover:text-text-primary">Installation</li>
            <li className="py-2 text-sm text-text-secondary hover:text-text-primary">Usage</li>
            <li className="py-2 text-sm text-text-secondary hover:text-text-primary">Examples</li>
            <li className="py-2 text-sm text-text-secondary hover:text-text-primary">API Reference</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
