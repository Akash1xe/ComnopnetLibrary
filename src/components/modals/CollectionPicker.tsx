import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import * as collectionsApi from "../../api/collections";
import { useAuth } from "../../hooks/useAuth";
import { useComponentStore } from "../../stores/componentStore";
import { Button } from "../ui/Button";

export function CollectionPicker({ componentId }: { componentId: string }) {
  const { isLoggedIn } = useAuth();
  const { savedComponentIds, toggleSavedComponent } = useComponentStore();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: collectionsApi.getMyCollections,
    enabled: isLoggedIn,
  });

  const createMutation = useMutation({
    mutationFn: collectionsApi.createCollection,
    onSuccess: async (collection) => {
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      if (collection.id) {
        await collectionsApi.addToCollection(collection.id, componentId);
        toggleSavedComponent(componentId);
      }
      setName("");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ collectionId, saved }: { collectionId: string; saved: boolean }) => {
      return saved
        ? collectionsApi.removeFromCollection(collectionId, componentId)
        : collectionsApi.addToCollection(collectionId, componentId);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      if (!savedComponentIds.includes(componentId) || variables.saved) {
        toggleSavedComponent(componentId);
      }
    },
  });

  const membership = useMemo(() => {
    return new Map(collectionsQuery.data?.map((collection) => [collection.id, Boolean(collection.components?.some((item) => item.id === componentId))]) ?? []);
  }, [collectionsQuery.data, componentId]);

  if (!isLoggedIn) {
    return <p className="text-sm text-text-secondary">Sign in to save components.</p>;
  }

  return (
    <div className="space-y-3 rounded-[16px] border border-border-default bg-bg-card p-4">
      <div className="space-y-2">
        {collectionsQuery.data?.map((collection) => {
          const saved = membership.get(collection.id) ?? false;
          return (
            <button
              key={collection.id}
              className="flex w-full items-center justify-between rounded-[12px] border border-border-subtle px-3 py-3 text-left text-sm text-text-primary transition hover:bg-white/4"
              onClick={() => saveMutation.mutate({ collectionId: collection.id, saved })}
              type="button"
            >
              <div>
                <p>{collection.name}</p>
                <p className="text-xs text-text-secondary">{collection.component_count} saved</p>
              </div>
              {saveMutation.isPending && saveMutation.variables?.collectionId === collection.id ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-accent-cyan" />
              ) : saved ? (
                <Check className="h-4 w-4 text-accent-cyan" />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="border-t border-border-subtle pt-3">
        <input
          className="w-full rounded-[12px] border border-border-default bg-black px-3 py-2 text-sm text-text-primary outline-none focus-visible:focus-ring"
          onChange={(event) => setName(event.target.value)}
          placeholder="Create new collection"
          value={name}
        />
        <Button
          className="mt-3"
          fullWidth
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate({ name, is_public: false })}
        >
          Create collection
        </Button>
      </div>
    </div>
  );
}
