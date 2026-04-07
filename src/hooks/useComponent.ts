import { useMutation, useQuery } from "@tanstack/react-query";
import * as componentsApi from "../api/components";
import type { ComponentFilters } from "../types";

export function useComponents(filters: ComponentFilters) {
  return useQuery({
    queryKey: ["components", filters],
    queryFn: () => componentsApi.getComponents(filters),
    staleTime: 300_000,
  });
}

export function useComponent(slug: string) {
  return useQuery({
    queryKey: ["component", slug],
    queryFn: () => componentsApi.getComponent(slug),
    enabled: Boolean(slug),
    staleTime: 600_000,
  });
}

export function useFeaturedComponents() {
  return useQuery({
    queryKey: ["featured-components"],
    queryFn: componentsApi.getFeatured,
    staleTime: 300_000,
  });
}

export function useTrendingComponents() {
  return useQuery({
    queryKey: ["trending-components"],
    queryFn: componentsApi.getTrending,
    staleTime: 300_000,
  });
}

export function useRelatedComponents(slug: string) {
  return useQuery({
    queryKey: ["related-components", slug],
    queryFn: () => componentsApi.getRelated(slug),
    enabled: Boolean(slug),
    staleTime: 300_000,
  });
}

export function useRecordView(slug: string) {
  return useMutation({
    mutationFn: () => componentsApi.recordView(slug),
  });
}

export function useCopyComponent() {
  return useMutation({
    mutationFn: componentsApi.copyComponent,
  });
}

export function useDownloadComponent() {
  return useMutation({
    mutationFn: componentsApi.downloadComponent,
  });
}
