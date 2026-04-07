import { useState } from "react";
import { DataTable } from "../../components/admin/DataTable";
import { SlideOver } from "../../components/admin/SlideOver";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Button } from "../../components/ui/Button";

const users = [
  { name: "Alex Builder", email: "alex@example.com", username: "alex", tier: "PRO", verified: "Yes", joined: "2025-01-15" },
  { name: "Casey Team", email: "casey@example.com", username: "casey", tier: "TEAM", verified: "Yes", joined: "2025-02-07" },
];

export default function AdminUsersPage() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(typeof users)[number] | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-white">Manage Users</h1>
        <DataTable
          columns={[
            { key: "name", header: "Avatar + Name" },
            { key: "email", header: "Email" },
            { key: "username", header: "Username" },
            { key: "tier", header: "Tier" },
            { key: "verified", header: "Verified" },
            { key: "joined", header: "Joined" },
          ]}
          data={users}
          onRowClick={(row) => {
            setSelectedUser(row);
            setOpen(true);
          }}
        />
        <SlideOver open={open} onClose={() => setOpen(false)} title="User detail">
          <div className="space-y-5">
            <p className="text-sm text-[#777]">Profile info, subscription history, and activity stats can be populated from admin endpoints.</p>
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#111] p-5">
              <p className="text-lg font-semibold text-white">{selectedUser?.name}</p>
              <p className="mt-2 text-sm text-[#888]">{selectedUser?.email}</p>
              <p className="mt-2 text-sm text-[#888]">@{selectedUser?.username}</p>
            </div>
            <Button className="bg-red-500 text-white hover:bg-red-400">Deactivate account</Button>
          </div>
        </SlideOver>
      </div>
    </AdminLayout>
  );
}
