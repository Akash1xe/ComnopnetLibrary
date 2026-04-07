import { useQuery, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Check, CreditCard, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import * as authApi from "../../api/auth";
import * as subscriptionsApi from "../../api/subscriptions";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { useUpgrade } from "../../hooks/useUpgrade";
import { useAuthStore } from "../../stores/authStore";

function SubscriptionStatusBadge({ status }: { status: string }) {
  const classes =
    status === "active"
      ? "bg-emerald-400/10 text-emerald-300"
      : status === "past_due"
        ? "bg-amber-400/10 text-amber-300"
        : status === "trialing"
          ? "bg-cyan-400/10 text-cyan-300"
          : "bg-red-400/10 text-red-300";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${classes}`}>{status}</span>;
}

export default function BillingPage() {
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const queryClient = useQueryClient();
  const { startCheckout, isLoading } = useUpgrade();
  const updateUser = useAuthStore((state) => state.updateUser);
  const subscriptionQuery = useQuery({ queryKey: ["subscription"], queryFn: subscriptionsApi.getMySubscription });
  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: subscriptionsApi.getPlans });
  const currentPlan = subscriptionQuery.data?.plan ?? "free";

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Welcome to Pro! Your account has been upgraded.");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      authApi.getMe().then((user) => {
        updateUser({ subscription_tier: user.subscription_tier });
      });
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }
  }, [queryClient, searchParams, updateUser]);

  const activeSubscription = subscriptionQuery.data;
  const showPortal = activeSubscription && activeSubscription.plan !== "free";
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Billing & Subscription</h1>
          <p className="mt-2 text-sm text-[#777]">Manage your plan, billing cycle, and Stripe portal access.</p>
        </div>

        <section className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#777]">Current Plan</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{currentPlan[0]!.toUpperCase() + currentPlan.slice(1)} Plan</h2>
            </div>
            <SubscriptionStatusBadge status={activeSubscription?.status ?? "active"} />
          </div>
          {activeSubscription?.current_period_end ? (
            <p className="mt-4 text-sm text-[#888]">Current period ends: {new Date(activeSubscription.current_period_end).toLocaleDateString()}</p>
          ) : null}
          {activeSubscription?.cancel_at_period_end ? (
            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
              Your plan cancels on {new Date(activeSubscription.current_period_end ?? "").toLocaleDateString()}.
            </div>
          ) : null}
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Pricing Plans</h2>
            <div className="grid grid-cols-2 rounded-full border border-[#1e1e1e] bg-[#111] p-1 text-sm">
              {(["monthly", "annual"] as const).map((item) => (
                <button
                  key={item}
                  className={`rounded-full px-4 py-2 capitalize ${billingPeriod === item ? "bg-cyan-400 text-black" : "text-[#777]"}`}
                  onClick={() => setBillingPeriod(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {plans.map((plan) => {
              const price = billingPeriod === "monthly" ? plan.price_monthly : plan.price_annual;
              const isCurrent = currentPlan === plan.name;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 ${plan.name === "pro" ? "border-cyan-400/30 bg-cyan-400/5" : "border-[#1e1e1e] bg-[#0f0f0f]"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{plan.name.toUpperCase()}</h3>
                    {plan.name === "pro" ? <span className="rounded-full bg-cyan-400 px-2 py-1 text-xs font-semibold text-black">Most Popular</span> : null}
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-white">
                    ${price}
                    <span className="text-base text-[#777]">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                  </p>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-[#ddd]">
                        <Check className="h-4 w-4 text-cyan-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    {plan.name === "free" && isCurrent ? (
                      <Button disabled fullWidth variant="secondary">
                        Current plan
                      </Button>
                    ) : plan.name === "free" ? null : (
                      <Button
                        fullWidth
                        loading={isLoading}
                        onClick={() => startCheckout(plan.name, billingPeriod)}
                        variant={plan.name === "pro" ? "primary" : "secondary"}
                      >
                        {isCurrent ? "Current Plan" : `Upgrade to ${plan.name[0]!.toUpperCase() + plan.name.slice(1)}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {showPortal ? (
          <section className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <h2 className="text-xl font-semibold text-white">Billing Actions</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={async () => {
                  const { portal_url } = await subscriptionsApi.getBillingPortal();
                  window.open(portal_url, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Manage Billing
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  const response = await subscriptionsApi.cancelSubscription();
                  toast.success(response.message);
                  queryClient.invalidateQueries({ queryKey: ["subscription"] });
                }}
              >
                Cancel Plan
              </Button>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Invoice History</h2>
              <p className="text-sm text-[#777]">View invoice history in the Billing Portal.</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
