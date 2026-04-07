import type { ReactNode } from "react";

export function SlideOver({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose}>
      <div
        className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-[#1e1e1e] bg-[#0f0f0f] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button className="text-sm text-[#888]" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
