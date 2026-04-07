import { CheckCircle2, Lock } from "lucide-react";
import { useUpgrade } from "../../hooks/useUpgrade";
import { Button } from "../ui/Button";

const benefits = ["Unlock premium components", "Download source files", "Save unlimited collections", "Priority support"];

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { startCheckout, isLoading } = useUpgrade();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#1e1e1e] bg-[#111] p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-semibold text-white">Unlock Pro Components</h3>
        <p className="mt-2 text-sm text-[#888]">Get instant access to premium source files, downloads, and advanced layouts.</p>
        <div className="mt-6 space-y-3">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 text-sm text-[#ddd]">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              {benefit}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-sm text-[#888]">Starting at</p>
          <p className="text-3xl font-semibold text-white">$19/month</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button fullWidth loading={isLoading} onClick={() => startCheckout("pro", "monthly")}>
            Upgrade Now
          </Button>
          <Button fullWidth variant="secondary" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
