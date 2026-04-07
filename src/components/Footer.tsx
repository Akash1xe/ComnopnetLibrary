import { Globe, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoMark, pageShell } from "../site";

const groups = {
  Product: ["Components", "Templates", "Pricing"],
  Developers: ["Docs", "API", "Status"],
  Company: ["About", "Blog", "Contact"],
};

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-[#050505]">
      <div className={`${pageShell} grid gap-10 py-12 md:grid-cols-[1.2fr_2fr]`}>
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="w-8 text-text-primary" />
            <div>
              <p className="text-sm font-semibold text-text-primary">[YourBrandName]</p>
              <p className="text-sm text-text-secondary">Production-ready UI building blocks.</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            {[Globe, Send, MessageCircle].map((Icon, index) => (
              <button key={index} className="inline-grid size-10 place-items-center rounded-[6px] border border-border-default bg-white/2 text-text-secondary transition hover:border-border-strong hover:bg-white/6 hover:text-text-primary" type="button">
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(groups).map(([title, links]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-text-primary">{title}</p>
              <div className="mt-4 space-y-3">
                {links.map((item) => (
                  <Link key={item} to="/" className="block text-sm text-text-secondary transition hover:text-text-primary">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
