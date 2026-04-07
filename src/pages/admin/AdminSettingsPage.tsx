import { AdminLayout } from "../../components/layouts/AdminLayout";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-8">
        <h1 className="text-3xl font-semibold text-white">Admin Settings</h1>
        <p className="mt-3 text-sm text-[#777]">Global platform configuration, moderation rules, and feature flags can live here.</p>
      </div>
    </AdminLayout>
  );
}
