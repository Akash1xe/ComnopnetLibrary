import { cn } from "../../lib/utils";

export function Skeleton({
  width = "100%",
  height = 16,
  rounded = "rounded-md",
  className,
}: {
  width?: number | string;
  height?: number | string;
  rounded?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-pulse bg-[#1a1a1a]", rounded, className)}
      style={{ width, height }}
    />
  );
}
