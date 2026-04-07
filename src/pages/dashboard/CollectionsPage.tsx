import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Pencil, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import * as collectionsApi from "../../api/collections";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function CollectionsPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const queryClient = useQueryClient();
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: collectionsApi.getMyCollections });
  const createMutation = useMutation({
    mutationFn: collectionsApi.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setOpen(false);
      setName("");
      setDescription("");
      setIsPublic(false);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">My Collections</h1>
            <p className="mt-2 text-sm text-[#777]">Group components for future reference and client projects.</p>
          </div>
          <Button onClick={() => setOpen(true)}>New Collection</Button>
        </div>

        {collectionsQuery.data?.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {collectionsQuery.data.map((collection) => (
              <div key={collection.id} className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{collection.name}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-[#666]">{collection.description}</p>
                  </div>
                  <span className="rounded-full border border-[#1e1e1e] px-2 py-1 text-xs text-[#888]">
                    {collection.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <div className="mt-4 text-sm text-[#777]">{collection.component_count} components</div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="aspect-square rounded-xl border border-[#1e1e1e] bg-[#141414]" />
                  ))}
                </div>
                <div className="mt-5 flex gap-2 text-sm text-[#888]">
                  <button className="rounded-xl border border-[#1e1e1e] p-2" type="button">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl border border-[#1e1e1e] p-2" type="button">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl border border-[#1e1e1e] p-2" type="button">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            action={<Button onClick={() => setOpen(true)}>Create your first collection</Button>}
            description="Save components to collections to organize inspiration, client work, and internal kits."
            icon={Bookmark}
            title="Save components to collections"
          />
        )}

        {open ? (
          <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-[#1e1e1e] bg-[#111] p-6">
              <h3 className="text-xl font-semibold text-white">Create Collection</h3>
              <div className="mt-5 space-y-4">
                <Input label="Name" onChange={(event) => setName(event.target.value)} value={name} />
                <Input label="Description" onChange={(event) => setDescription(event.target.value)} value={description} />
                <label className="flex items-center gap-3 text-sm text-[#bbb]">
                  <input checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} type="checkbox" />
                  Make this collection public
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <Button fullWidth loading={createMutation.isPending} onClick={() => createMutation.mutate({ name, description, is_public: isPublic })}>
                  Create collection
                </Button>
                <Button fullWidth variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
