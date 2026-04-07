import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCheckout } from "../api/subscriptions";
import type { BillingPeriod } from "../types";

export function useUpgrade() {
  const mutation = useMutation({
    mutationFn: ({ plan, billing }: { plan: string; billing: BillingPeriod }) => createCheckout(plan, billing),
    onSuccess: ({ checkout_url }) => {
      window.location.href = checkout_url;
    },
    onError: () => {
      toast.error("Unable to start checkout right now.");
    },
  });

  return {
    startCheckout: (plan: string, billing: BillingPeriod) => mutation.mutate({ plan, billing }),
    startCheckoutAsync: (plan: string, billing: BillingPeriod) => mutation.mutateAsync({ plan, billing }),
    isLoading: mutation.isPending,
  };
}
