import { Skeleton } from "./Skeleton";

export function CodeSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
      <Skeleton width="25%" height={12} />
      {["90%", "80%", "94%", "72%", "88%", "66%", "92%", "54%"].map((width, index) => (
        <Skeleton key={index} width={width} height={10} className="rounded-full" />
      ))}
    </div>
  );
}
