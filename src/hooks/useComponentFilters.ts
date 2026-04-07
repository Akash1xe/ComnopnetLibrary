import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ComponentFilters, ComponentSort, ComponentViewMode } from "../types";
import { useComponentStore } from "../stores/componentStore";

const DEFAULT_SORT: ComponentSort = "newest";

export function useComponentFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedFilters, setFilter, preferredView, setPreferredView, resetFilters } = useComponentStore();

  const filters = useMemo(
    () => ({
      category: searchParams.get("category"),
      framework: searchParams.get("framework") as ComponentFilters["framework"],
      tags: searchParams.get("tags")?.split(",").filter(Boolean) ?? [],
      is_free:
        searchParams.get("type") === "free" ? true : searchParams.get("type") === "pro" ? false : null,
      search: searchParams.get("q") ?? "",
      sort: (searchParams.get("sort") as ComponentSort | null) ?? DEFAULT_SORT,
      view: (searchParams.get("view") as ComponentViewMode | null) ?? preferredView,
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams, preferredView],
  );

  useEffect(() => {
    setFilter(filters);
    if (filters.view) {
      setPreferredView(filters.view);
    }
  }, [filters, setFilter, setPreferredView]);

  function update(next: Partial<typeof filters>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        (key === "sort" && value === DEFAULT_SORT) ||
        (key === "view" && value === "grid")
      ) {
        params.delete(key === "search" ? "q" : key);
        if (key === "is_free") {
          params.delete("type");
        }
        return;
      }

      if (key === "tags" && Array.isArray(value)) {
        params.set("tags", value.join(","));
        return;
      }

      if (key === "search") {
        params.set("q", String(value));
        return;
      }

      if (key === "is_free") {
        params.set("type", value ? "free" : "pro");
        return;
      }

      params.set(key, String(value));
    });

    setSearchParams(params, { replace: true });
  }

  return { filters, update, selectedFilters, resetFilters };
}
