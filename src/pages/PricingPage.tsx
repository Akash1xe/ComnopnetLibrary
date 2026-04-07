import { PricingCard, RouteCTA, bodyClass, faqs, h2Class, headingPill, pageShell, sectionHeading } from "../site";

export function PricingPage() {
  return (
    <main className={`${pageShell} min-h-[calc(100vh-60px)] pb-28`}>
      <div className={sectionHeading}>
        <span className={headingPill}>Pricing</span>
        <h2 className={h2Class}>One price. All components. Forever.</h2>
        <p className={bodyClass}>Start free. Upgrade when you&apos;re ready. No surprises.</p>
      </div>

      <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-border-subtle bg-bg-card p-1.5">
        <button className="rounded-full border border-border-default bg-white/2 px-3 py-2 text-sm text-text-primary transition hover:border-border-strong hover:bg-white/6">
          Monthly
        </button>
        <button className="rounded-full border border-white/20 bg-white/8 px-3 py-2 text-sm text-text-primary">
          Annually <span className="text-accent-cyan">Save 30%</span>
        </button>
      </div>

      <div className="mx-auto grid max-w-[1000px] gap-6 lg:grid-cols-3">
        <PricingCard
          name="Free"
          price="$0"
          suffix="/month"
          tagline="Perfect for side projects"
          features={[
            "✓ 30 free components",
            "✓ Community support",
            "✓ MIT License",
            "✗ No templates",
            "✗ No priority updates",
          ]}
          cta="Get Started Free"
        />
        <PricingCard
          name="Pro"
          price="$19"
          suffix="/month"
          tagline="For professional developers"
          features={[
            "✓ 100+ components (All)",
            "✓ All templates",
            "✓ Priority support",
            "✓ Early access to new components",
            "✓ Discord community access",
          ]}
          cta="Start Pro"
          featured
        />
        <PricingCard
          name="Team"
          price="$49"
          suffix="/month"
          tagline="Built for product teams"
          features={[
            "✓ Everything in Pro",
            "✓ Team license",
            "✓ Custom components",
            "✓ Slack support",
            "✓ SLA",
          ]}
          cta="Contact Sales"
        />
      </div>

      <div className="mt-10 grid justify-items-center gap-4">
        <span className="text-text-secondary">Used by teams at ____</span>
        <div className="flex flex-wrap justify-center gap-3">
          {["NOVA", "PULSE", "ARC", "INDEX", "STACK", "LATTICE"].map((company) => (
            <div
              key={company}
              className="rounded-full border border-border-subtle px-4 py-3 font-mono text-sm text-text-disabled"
            >
              {company}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-[900px] gap-3">
        {faqs.map((faq, index) => (
          <details
            key={faq.question}
            className="panel-surface overflow-hidden rounded-[16px]"
            open={index === 0}
          >
            <summary className="cursor-pointer list-none px-5 py-4 text-sm text-text-primary">
              {faq.question}
            </summary>
            <p className="px-5 pb-5 text-sm leading-[1.7] text-text-secondary">{faq.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <RouteCTA to="/docs">Browse Docs</RouteCTA>
      </div>
    </main>
  );
}
