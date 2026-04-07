export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-transparent px-6 py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1e1e1e] border-t-cyan-400" />
        <p className="text-sm text-[#888]">{label}</p>
      </div>
    </div>
  );
}
