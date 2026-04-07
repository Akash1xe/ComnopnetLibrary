import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import * as componentsApi from "../../api/components";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useState } from "react";

export default function AdminComponentsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-components", search, statusFilter],
    queryFn: () => componentsApi.getAdminComponents({ per_page: 100, search: search || undefined, status: (statusFilter as never) || undefined }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => componentsApi.deleteComponent(id, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-components"] }),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">Manage Components</h1>
            <p className="mt-2 text-sm text-text-secondary">Curate marketplace inventory, control publishing state, and maintain trust signals.</p>
          </div>
          <Link to="/admin/components/new"><Button><Plus className="h-4 w-4" />Create Component</Button></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Search" onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or tag" value={search} />
          <label className="grid gap-2 text-sm text-text-primary">
            <span>Status</span>
            <select className="min-h-11 rounded-[6px] border border-border-default bg-black px-4 text-text-primary" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/40 text-text-secondary">
              <tr>
                {['Name', 'Category', 'Author', 'Version', 'Access', 'Views', 'Created', 'Actions'].map((label) => (
                  <th key={label} className="px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.data?.items.map((component) => (
                <tr key={component.id} className="border-t border-border-subtle hover:bg-white/4">
                  <td className="px-4 py-3 text-text-primary">{component.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{component.category ?? 'Uncategorized'}</td>
                  <td className="px-4 py-3 text-text-secondary">@{component.author.username}</td>
                  <td className="px-4 py-3 text-text-secondary">{component.version}</td>
                  <td className="px-4 py-3 text-text-secondary">{component.is_free ? 'Free' : 'Pro'}</td>
                  <td className="px-4 py-3 text-text-secondary">{component.views_count}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(component.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link className="rounded-[10px] border border-border-default p-2 text-text-secondary hover:bg-white/6" to={`/components/${component.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link className="rounded-[10px] border border-border-default p-2 text-text-secondary hover:bg-white/6" to={`/admin/components/${component.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        className="rounded-[10px] border border-border-default p-2 text-red-300 hover:bg-red-500/10"
                        onClick={() => setSelected({ id: component.id, name: component.name })}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmDialog
          confirmLabel="Archive component"
          danger
          description={selected ? `Archive ${selected.name}? The component will no longer appear publicly.` : ""}
          onClose={() => setSelected(null)}
          onConfirm={() => {
            if (selected) {
              deleteMutation.mutate(selected.id);
            }
            setSelected(null);
          }}
          open={Boolean(selected)}
          title="Archive component?"
        />
      </div>
    </AdminLayout>
  );
}
