import { BarChart3 } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white">Admin Analytics</h1>
          <div className="grid grid-cols-3 rounded-2xl border border-[#1e1e1e] bg-[#111] p-1 text-sm">
            {["7d", "30d", "90d"].map((period) => (
              <button key={period} className={`rounded-xl px-4 py-2 ${period === "30d" ? "bg-cyan-400 text-black" : "text-[#777]"}`} type="button">
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-10 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-cyan-400" />
          <p className="mt-4 text-lg font-semibold text-white">Top components, geography, and referrer sources</p>
          <p className="mt-2 text-sm text-[#777]">This page is ready for the backend analytics expansion endpoints.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
