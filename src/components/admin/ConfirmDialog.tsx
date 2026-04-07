import { Button } from "../ui/Button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  danger = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#1e1e1e] bg-[#111] p-6">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-[#777]">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button
            className={danger ? "bg-red-500 text-white hover:bg-red-400" : undefined}
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button fullWidth variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
