import { useQuery } from "@tanstack/react-query";
import { Grid2x2, List, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import * as componentsApi from "../api/components";
import { ComponentCard, ComponentCardSkeleton } from "../components/ComponentCard";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useComponentFilters } from "../hooks/useComponentFilters";
import { useFeaturedComponents } from "../hooks/useComponent";
import { pageShell, panelClass } from "../site";
import type { Category, Tag } from "../types";

export default function ComponentsPage() {
  const { filters, update, resetFilters } = useComponentFilters();
  const [searchValue, setSearchValue] = useState(filters.search);
  const categoriesQuery = useQuery({ queryKey: ["component-categories"], queryFn: componentsApi.getCategories, staleTime: 1_800_000 });
  const tagsQuery = useQuery({ queryKey: ["component-tags"], queryFn: componentsApi.getTags, staleTime: 1_800_000 });
  const featuredQuery = useFeaturedComponents();
  const componentsQuery = useQuery({
    queryKey: ["components", filters],
    queryFn: () =>
      componentsApi.getComponents({
        page: filters.page,
        per_page: 12,
        category: filters.category || undefined,
        framework: filters.framework || undefined,
        tags: filters.tags,
        is_free: filters.is_free ?? undefined,
        search: filters.search || undefined,
        sort: filters.sort,
      }),
    staleTime: 300_000,
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      update({ search: searchValue, page: 1 });
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchValue, update]);

  const sidebar = (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Categories</h3>
        <div className="space-y-2">
          <button
            className={`w-full rounded-[10px] border-l-2 px-3 py-2 text-left text-sm ${!filters.category ? "border-accent-cyan text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}
            onClick={() => update({ category: null, page: 1 })}
            type="button"
          >
            All components
          </button>
          {categoriesQuery.data?.map((item: Category) => (
            <button
              key={item.id}
              className={`flex w-full items-center justify-between rounded-[10px] border-l-2 px-3 py-2 text-left text-sm ${filters.category === item.slug ? "border-accent-cyan text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}
              onClick={() => update({ category: filters.category === item.slug ? null : item.slug, page: 1 })}
              type="button"
            >
              <span>{item.name}</span>
              <span className="rounded-full border border-border-subtle bg-bg-card px-2 py-1 text-xs text-text-secondary">{item.count ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Framework</h3>
        <div className="space-y-2">
          {["react", "vue", "svelte", "angular", "html"].map((framework) => (
            <button
              key={framework}
              className={`w-full rounded-[10px] border px-3 py-2 text-left text-sm ${filters.framework === framework ? "border-accent-cyan bg-white/6 text-text-primary" : "border-border-subtle text-text-secondary hover:text-text-primary"}`}
              onClick={() => update({ framework: filters.framework === framework ? null : (framework as typeof filters.framework), page: 1 })}
              type="button"
            >
              {framework[0]!.toUpperCase() + framework.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Access</h3>
        <div className="grid grid-cols-3 gap-2 rounded-[14px] border border-border-subtle bg-bg-card p-1">
          {[
            { label: "all", value: null as boolean | null },
            { label: "free", value: true as boolean | null },
            { label: "pro", value: false as boolean | null },
          ].map(({ label, value }) => (
            <button
              key={label}
              className={`rounded-[10px] px-3 py-2 text-sm capitalize ${filters.is_free === value || (label === "all" && filters.is_free === null) ? "bg-accent-cyan text-black" : "text-text-secondary"}`}
              onClick={() => update({ is_free: value, page: 1 })}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tagsQuery.data?.slice(0, 18).map((item: Tag) => {
            const active = filters.tags.includes(item.slug);
            return (
              <button
                key={item.id}
                className={`rounded-full border px-3 py-2 text-xs ${active ? "border-accent-cyan bg-white/6 text-accent-cyan" : "border-border-default bg-bg-card text-text-secondary"}`}
                onClick={() =>
                  update({
                    tags: active ? filters.tags.filter((tag) => tag !== item.slug) : [...filters.tags, item.slug],
                    page: 1,
                  })
                }
                type="button"
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  const hasActiveFilters = Boolean(filters.category || filters.framework || filters.tags.length || filters.search || filters.is_free !== null);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar />
      <div className={`${pageShell} flex gap-6 pt-10`}>
        <aside className={`${panelClass} sticky top-24 hidden h-fit w-[260px] lg:block`}>
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1 space-y-8">
          {!hasActiveFilters && featuredQuery.data?.length ? (
            <section className={`${panelClass} rounded-[20px]`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full border border-border-default bg-white/6 p-2 text-accent-cyan">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Featured Components</p>
                  <p className="text-sm text-text-secondary">A curated set of high-signal building blocks from the library.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featuredQuery.data.slice(0, 3).map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            </section>
          ) : null}

          <div className={`${panelClass} flex flex-col gap-4 rounded-[20px] md:flex-row md:items-center`}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                className="w-full rounded-[12px] border border-border-default bg-black px-11 py-3 text-sm text-text-primary outline-none focus-visible:focus-ring"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search components, tags, categories"
                value={searchValue}
              />
              {searchValue ? (
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" onClick={() => setSearchValue("")} type="button">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <select
              className="rounded-[12px] border border-border-default bg-bg-card px-4 py-3 text-sm text-text-primary outline-none"
              onChange={(event) => update({ sort: event.target.value as typeof filters.sort, page: 1 })}
              value={filters.sort}
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
            <div className="hidden items-center gap-2 rounded-[12px] border border-border-default bg-bg-card p-1 md:flex">
              <button
                className={`rounded-[8px] p-2 ${filters.view === "grid" ? "bg-accent-cyan text-black" : "text-text-secondary"}`}
                onClick={() => update({ view: "grid" })}
                type="button"
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
              <button
                className={`rounded-[8px] p-2 ${filters.view === "list" ? "bg-accent-cyan text-black" : "text-text-secondary"}`}
                onClick={() => update({ view: "list" })}
                type="button"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button className="lg:hidden" variant="secondary">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Showing {componentsQuery.data?.total ?? 0} components</span>
            {hasActiveFilters ? (
              <button
                className="rounded-full border border-border-default px-3 py-1.5 text-text-primary transition hover:bg-white/6"
                onClick={() => {
                  resetFilters();
                  update({ category: null, framework: null, tags: [], is_free: null, search: "", sort: "newest", page: 1 });
                  setSearchValue("");
                }}
                type="button"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {componentsQuery.isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ComponentCardSkeleton key={index} />
              ))}
            </div>
          ) : componentsQuery.data?.items.length ? (
            <div className={filters.view === "list" ? "space-y-4" : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
              {componentsQuery.data.items.map((component) => (
                <ComponentCard key={component.id} component={component} view={filters.view} />
              ))}
            </div>
          ) : (
            <div className={`${panelClass} rounded-[20px] px-6 py-16 text-center`}>
              <p className="font-display text-3xl tracking-[-0.04em] text-text-primary">No components found</p>
              <p className="mt-3 text-sm text-text-secondary">Try a broader search, fewer filters, or explore the featured collection above.</p>
              <Button className="mt-6" onClick={() => { resetFilters(); update({ category: null, framework: null, tags: [], is_free: null, search: "", sort: "newest", page: 1 }); setSearchValue(""); }}>
                Reset filters
              </Button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
