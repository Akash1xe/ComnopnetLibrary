import { apiClient } from "../lib/axios";
import type { Category, Component, ComponentFilters, PaginatedResponse, BackendPaginatedResponse } from "../types";

function unwrapPaginated<T>(payload: BackendPaginatedResponse<T>): PaginatedResponse<T> {
  return {
    items: payload.items,
    total: payload.meta.total,
    page: payload.meta.page,
    per_page: payload.meta.per_page,
    pages: payload.meta.pages,
  };
}

export function getCategories(): Promise<Category[]> {
  return apiClient.get("/components/categories").then((response) => response.data);
}

export function getCategoryComponents(slug: string, filters: ComponentFilters = {}): Promise<PaginatedResponse<Component>> {
  return apiClient.get(`/components/categories/${slug}/components`, { params: filters }).then((response) => unwrapPaginated<Component>(response.data));
}
