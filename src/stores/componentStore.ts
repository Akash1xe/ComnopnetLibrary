import { create } from "zustand";
import type { Component, ComponentFilters, ComponentViewMode } from "../types";

interface ComponentStoreState {
  selectedFilters: ComponentFilters;
  preferredView: ComponentViewMode;
  savedComponentIds: string[];
  recentlyViewed: Pick<Component, "id" | "slug" | "name" | "preview_image_url">[];
  setFilter: (patch: Partial<ComponentFilters>) => void;
  resetFilters: () => void;
  setPreferredView: (view: ComponentViewMode) => void;
  toggleSavedComponent: (componentId: string) => void;
  markViewed: (component: Pick<Component, "id" | "slug" | "name" | "preview_image_url">) => void;
}

const defaultFilters: ComponentFilters = {
  sort: "newest",
  tags: [],
  page: 1,
};

export const useComponentStore = create<ComponentStoreState>((set) => ({
  selectedFilters: defaultFilters,
  preferredView: "grid",
  savedComponentIds: [],
  recentlyViewed: [],
  setFilter: (patch) =>
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        ...patch,
      },
    })),
  resetFilters: () => set({ selectedFilters: defaultFilters }),
  setPreferredView: (view) => set({ preferredView: view }),
  toggleSavedComponent: (componentId) =>
    set((state) => ({
      savedComponentIds: state.savedComponentIds.includes(componentId)
        ? state.savedComponentIds.filter((id) => id !== componentId)
        : [...state.savedComponentIds, componentId],
    })),
  markViewed: (component) =>
    set((state) => ({
      recentlyViewed: [component, ...state.recentlyViewed.filter((item) => item.id !== component.id)].slice(0, 12),
    })),
}));
