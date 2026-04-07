import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
}) {
  const positive = (trend ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#777]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof trend === "number" ? (
        <div className={`mt-4 inline-flex items-center gap-1 text-sm ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {Math.abs(trend)}%
        </div>
      ) : null}
    </div>
  );
}
