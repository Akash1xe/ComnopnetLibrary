import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAdminOverview } from "../../api/analytics";
import { DataTable } from "../../components/admin/DataTable";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import { Users, Shapes, CreditCard, DollarSign } from "lucide-react";

export default function AdminOverviewPage() {
  const query = useQuery({ queryKey: ["admin-overview"], queryFn: getAdminOverview });
  const data = query.data;
  const chartData = Array.from({ length: 7 }).map((_, index) => ({
    name: `Day ${index + 1}`,
    users: Math.round((data?.users_count ?? 0) / 8) + index * 3,
    revenue: Math.round((data?.mrr ?? 0) / 12) + index * 25,
  }));

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold text-white">Admin Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={data?.users_count ?? 0} />
          <StatCard icon={Shapes} label="Pending Approval" value={data?.pending_components ?? 0} />
          <StatCard icon={CreditCard} label="Active Subscriptions" value={data?.active_subscriptions ?? 0} />
          <StatCard icon={DollarSign} label="MRR" value={`$${data?.mrr ?? 0}`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Users over time</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid stroke="#1e1e1e" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #1e1e1e" }} />
                  <Area dataKey="users" fill="#a855f7" fillOpacity={0.2} stroke="#a855f7" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Revenue over time</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#1e1e1e" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #1e1e1e" }} />
                  <Bar dataKey="revenue" fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable
          columns={[
            { key: "name", header: "Pending Approval" },
            { key: "author", header: "Author" },
            { key: "category", header: "Category" },
            { key: "created_at", header: "Created" },
          ]}
          data={[
            { name: "Animated Tabs", author: "@buildit", category: "navigation", created_at: "Today" },
            { name: "Hero Banner", author: "@studio", category: "layout", created_at: "Yesterday" },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
