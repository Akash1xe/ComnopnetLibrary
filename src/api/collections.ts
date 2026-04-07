import { apiClient } from "../lib/axios";
import type { Collection } from "../types";

function normalizeCollection(collection: Collection): Collection {
  return {
    ...collection,
    component_count: collection.component_count ?? collection.components?.length ?? 0,
  };
}

export function getMyCollections(): Promise<Collection[]> {
  return apiClient.get("/collections").then((response) => response.data.map(normalizeCollection));
}

export function getCollection(id: string): Promise<Collection> {
  return getMyCollections().then((collections) => {
    const item = collections.find((collection) => collection.id === id || collection.slug === id);
    if (!item) {
      throw new Error("Collection not found.");
    }
    return item;
  });
}

export function createCollection(data: {
  name: string;
  description?: string;
  is_public?: boolean;
}): Promise<Collection> {
  return apiClient.post("/collections", data).then((response) => normalizeCollection(response.data));
}

export function addToCollection(collectionId: string, componentId: string): Promise<{ message: string }> {
  return apiClient.post(`/collections/${collectionId}/components`, { component_id: componentId }).then((response) => response.data);
}

export function removeFromCollection(collectionId: string, componentId: string): Promise<{ message: string }> {
  return apiClient.delete(`/collections/${collectionId}/components/${componentId}`).then((response) => response.data);
}

export function deleteCollection(id: string): Promise<{ message: string }> {
  return apiClient.delete(`/collections/${id}`).then((response) => response.data);
}

export function getPublicCollections(): Promise<Collection[]> {
  return apiClient.get("/collections/public").then((response) => response.data.map(normalizeCollection));
}
