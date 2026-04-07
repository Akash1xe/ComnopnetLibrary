import { apiClient } from "../lib/axios";
import type {
  BackendPaginatedResponse,
  CodeFile,
  Component,
  ComponentCreate,
  ComponentDetail,
  ComponentFilters,
  ComponentSubmission,
  ComponentUpdate,
  PaginatedResponse,
} from "../types";

function unwrapPaginated<T>(payload: BackendPaginatedResponse<T>): PaginatedResponse<T> {
  return {
    items: payload.items,
    total: payload.meta.total,
    page: payload.meta.page,
    per_page: payload.meta.per_page,
    pages: payload.meta.pages,
  };
}

export function getComponents(params: ComponentFilters): Promise<PaginatedResponse<Component>> {
  return apiClient.get("/components", { params }).then((response) => unwrapPaginated<Component>(response.data));
}

export function getComponent(slug: string): Promise<ComponentDetail> {
  return apiClient.get(`/components/${slug}`).then((response) => response.data);
}

export function recordView(slug: string): Promise<{ message: string }> {
  return apiClient.post(`/components/${slug}/view`).then((response) => response.data);
}

export function copyComponent(slug: string): Promise<{ code_files: CodeFile[]; message: string }> {
  return apiClient.post(`/components/${slug}/copy`).then((response) => response.data);
}

export function downloadComponent(slug: string): Promise<Blob> {
  return apiClient.post(`/components/${slug}/download`, undefined, { responseType: "blob" }).then((response) => response.data);
}

export function getFeatured(): Promise<Component[]> {
  return apiClient.get("/components/featured").then((response) => response.data);
}

export function getTrending(): Promise<Component[]> {
  return apiClient.get("/components/trending").then((response) => response.data);
}

export function getRelated(slug: string): Promise<Component[]> {
  return apiClient.get(`/components/${slug}/related`).then((response) => response.data);
}

export function getCategories() {
  return apiClient.get("/components/categories").then((response) => response.data);
}

export function getTags() {
  return apiClient.get("/components/tags").then((response) => response.data);
}

export function searchComponents(q: string, page = 1): Promise<PaginatedResponse<Component>> {
  return getComponents({ search: q, page, per_page: 20 });
}

export function createComponent(data: ComponentCreate): Promise<ComponentDetail> {
  return apiClient.post("/admin/components", data).then((response) => response.data);
}

export function updateComponent(idOrSlug: string, data: ComponentUpdate, admin = false): Promise<ComponentDetail> {
  const path = admin ? `/admin/components/${idOrSlug}` : `/components/${idOrSlug}`;
  return apiClient.patch(path, data).then((response) => response.data);
}

export function deleteComponent(idOrSlug: string, admin = false): Promise<{ message: string } | void> {
  const path = admin ? `/admin/components/${idOrSlug}` : `/components/${idOrSlug}`;
  return apiClient.delete(path).then((response) => response.data);
}

export function getAdminComponents(params: ComponentFilters): Promise<PaginatedResponse<Component>> {
  return apiClient.get("/admin/components", { params }).then((response) => unwrapPaginated<Component>(response.data));
}

export function getAdminComponent(id: string): Promise<ComponentDetail> {
  return apiClient.get(`/admin/components/${id}`).then((response) => response.data);
}

export function updateComponentStatus(id: string, status: string): Promise<{ message: string }> {
  return apiClient.patch(`/admin/components/${id}/status`, { status }).then((response) => response.data);
}

export function getCreatorComponents(): Promise<ComponentSubmission[]> {
  return apiClient.get("/components/creator/components").then((response) => response.data);
}

export function submitComponent(data: {
  name: string;
  slug: string;
  short_description?: string | null;
  long_description?: string | null;
  framework: string;
  payload?: Record<string, unknown>;
}): Promise<ComponentSubmission> {
  return apiClient.post("/components/creator/components/submit", data).then((response) => response.data);
}
