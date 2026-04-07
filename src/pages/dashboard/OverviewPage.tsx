import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bookmark, Copy, Eye, Layers3 } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboard } from "../../api/analytics";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { PageLoader } from "../../components/ui/PageLoader";
import { useAuth } from "../../hooks/useAuth";

export default function OverviewPage() {
  const { user, isPro } = useAuth();
  const query = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: getDashboard,
  });

  if (query.isLoading) {
    return (
      <DashboardLayout>
        <PageLoader label="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  const data = query.data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Overview</h1>
          <p className="mt-2 text-sm text-[#777]">Track usage, top-performing components, and subscription status.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Eye} label="Total Views (30d)" trend={data?.total_views_trend ?? 12} value={data?.total_views ?? 0} />
          <StatCard icon={Copy} label="Total Copies (30d)" trend={data?.total_copies_trend ?? 8} value={data?.total_copies ?? 0} />
          <StatCard icon={Bookmark} label="Collections" value={data?.collections_count ?? 0} />
          <StatCard icon={Layers3} label="Subscription Tier" value={user?.subscription_tier?.toUpperCase() ?? "FREE"} />
        </div>

        {!isPro ? (
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white">Copies today: {data?.copies_today ?? 0}/{data?.copies_limit ?? 20}</span>
              <span className="text-[#666]">Resets at midnight UTC</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-[#1a1a1a]">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${Math.min(100, (((data?.copies_today ?? 0) / (data?.copies_limit ?? 20)) || 0) * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Views over time</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.views_by_day ?? []}>
                <CartesianGrid stroke="#1e1e1e" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #1e1e1e", color: "#fff" }} />
                <Line dataKey="views" stroke="#22d3ee" strokeWidth={2} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Top Components</h2>
            <div className="overflow-hidden rounded-xl border border-[#1e1e1e]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#111] text-[#777]">
                  <tr>
                    <th className="px-4 py-3">Component</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Copies</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.top_components?.map((component) => (
                    <tr key={component.slug} className="border-t border-[#1e1e1e] hover:bg-[#141414]">
                      <td className="px-4 py-3 text-white">{component.name}</td>
                      <td className="px-4 py-3 text-[#aaa]">{component.views}</td>
                      <td className="px-4 py-3 text-[#aaa]">{component.copies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <EmptyState
            action={null}
            description="Recent events and detailed attribution can plug into this panel as your backend analytics expands."
            icon={Bookmark}
            title="No recent activity"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
