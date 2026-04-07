import { Copy, Eye, Lock, Sparkles } from "lucide-react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../lib/queryClient";
import type { Component } from "../types";
import { panelClass } from "../site";
import { Skeleton } from "./ui/Skeleton";

function ComponentCardImpl({ component, view = "grid" }: { component: Component; view?: "grid" | "list" }) {
  const navigate = useNavigate();

  return (
    <article
      className={`${panelClass} group cursor-pointer overflow-hidden rounded-[18px] p-0 transition duration-200 hover:-translate-y-px hover:border-border-strong ${
        view === "list" ? "flex gap-4" : ""
      }`}
      onClick={() => navigate(`/components/${component.slug}`)}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ["component", component.slug],
          queryFn: () => import("../api/components").then((mod) => mod.getComponent(component.slug)),
        });
      }}
    >
      <div className={`relative overflow-hidden bg-black ${view === "list" ? "h-40 w-56 rounded-l-[18px]" : "aspect-video"}`}>
        {component.preview_image_url ? (
          <img alt={component.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" src={component.preview_image_url} />
        ) : (
          <div className="h-full w-full animate-pulse bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {component.category ? <span className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] text-text-primary">{component.category}</span> : null}
          <span className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] text-text-secondary">{component.framework}</span>
        </div>
        <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-text-primary">
          {component.is_pro ? <span className="inline-flex items-center gap-1 text-accent-cyan"><Lock className="h-3.5 w-3.5" />PRO</span> : "FREE"}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{component.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{component.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {component.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-border-default px-2 py-1 text-[11px] text-text-secondary">{tag}</span>
          ))}
          {component.tags.length > 3 ? <span className="rounded-full border border-border-default px-2 py-1 text-[11px] text-text-secondary">+{component.tags.length - 3} more</span> : null}
        </div>

        {component.trust_badges.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {component.trust_badges.slice(0, 3).map((badge) => (
              <span key={badge.badge_type} className="inline-flex items-center gap-1 rounded-full border border-border-default bg-white/4 px-2.5 py-1 text-[11px] text-text-primary">
                <Sparkles className="h-3 w-3 text-accent-cyan" />
                {badge.badge_type.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-5 text-xs text-text-secondary">
          <span>by @{component.author.username}</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{component.views_count}</span>
            <span className="inline-flex items-center gap-1"><Copy className="h-3.5 w-3.5" />{component.copies_count}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export const ComponentCard = memo(ComponentCardImpl);

export function ComponentCardSkeleton() {
  return (
    <div className={`${panelClass} overflow-hidden rounded-[18px] p-0`}>
      <Skeleton height={220} rounded="rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton width="35%" height={18} />
        <Skeleton width="75%" height={18} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="82%" height={14} />
        <div className="flex gap-2 pt-2">
          <Skeleton width={56} height={24} rounded="rounded-full" />
          <Skeleton width={72} height={24} rounded="rounded-full" />
          <Skeleton width={40} height={24} rounded="rounded-full" />
        </div>
      </div>
    </div>
  );
}
