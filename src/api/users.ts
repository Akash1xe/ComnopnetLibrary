import { apiClient } from "../lib/axios";
import type { User } from "../types";

export function updateMe(data: Partial<User>): Promise<User> {
  return apiClient.patch("/users/me", data).then((response) => response.data);
}

export function changePassword(data: { current_password: string; new_password: string }) {
  return apiClient.post("/auth/change-password", data).then((response) => response.data);
}

export function saveNotifications(data: Record<string, boolean>) {
  return apiClient.put("/users/me/notifications", data).then((response) => response.data);
}

export function createAvatarUpload() {
  return apiClient.post("/users/me/avatar-upload").then((response) => response.data);
}
