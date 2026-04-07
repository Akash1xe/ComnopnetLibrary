import { apiClient } from "../lib/axios";
import type { AdminOverview, DashboardAnalytics } from "../types";

export function getDashboard(): Promise<DashboardAnalytics> {
  return apiClient.get("/analytics/dashboard").then((response) => response.data);
}

export function getComponentAnalytics(slug: string, period: string) {
  return apiClient.get(`/analytics/components/${slug}`, { params: { period } }).then((response) => response.data);
}

export function getAdminOverview(): Promise<AdminOverview> {
  return apiClient.get("/admin/dashboard").then((response) => response.data);
}
