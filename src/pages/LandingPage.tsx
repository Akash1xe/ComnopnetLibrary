import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-[-8rem] top-10 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-24 h-[480px] w-[480px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Premium UI building blocks for modern products
            </div>
            <h1 className="mt-8 max-w-3xl font-['Syne'] text-5xl leading-tight md:text-7xl">
              Connect your FastAPI backend to a frontend that already feels production-ready.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[#8a8a8a]">
              Browse components, copy code, manage billing, save collections, and give your team a polished dashboard from day one.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/components">
                <Button>
                  Explore components
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary">Create account</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-[32px] border border-[#1e1e1e] bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Auth", "Email auth, GitHub OAuth, token refresh, protected routes"],
                ["Components", "Search, filter, pro gating, code tabs, copy and download"],
                ["Dashboard", "Collections, analytics, billing, settings, admin tools"],
                ["Backend", "FastAPI-friendly Axios client, Query hooks, URL-synced state"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-[#1e1e1e] bg-[#111] p-5">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm text-[#777]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
