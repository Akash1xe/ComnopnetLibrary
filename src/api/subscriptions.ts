import { apiClient } from "../lib/axios";
import type { BillingPeriod, PlanInfo, Subscription } from "../types";

export function getPlans(): Promise<PlanInfo[]> {
  return apiClient.get("/subscriptions/plans").then((response) => response.data);
}

export function getMySubscription(): Promise<Subscription | null> {
  return apiClient.get("/subscriptions/me").then((response) => response.data);
}

export function createCheckout(plan: string, billing: BillingPeriod): Promise<{ checkout_url: string }> {
  return apiClient.post("/subscriptions/checkout", { plan, billing }).then((response) => response.data);
}

export function getBillingPortal(): Promise<{ portal_url: string }> {
  return apiClient.get("/subscriptions/portal").then((response) => response.data);
}

export function cancelSubscription(): Promise<{ message: string; cancels_at: string }> {
  return apiClient.post("/subscriptions/cancel").then((response) => response.data);
}
