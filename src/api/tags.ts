import { apiClient } from "../lib/axios";
import type { Tag } from "../types";

export function getTags(): Promise<Tag[]> {
  return apiClient.get("/components/tags").then((response) => response.data);
}
