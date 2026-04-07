import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as usersApi from "../../api/users";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { initials } from "../../lib/utils";

const profileSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().min(3),
});

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "security" | "notifications">("profile");
  const { user, updateUser } = useAuth();
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      username: user?.username ?? "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (nextUser) => updateUser(nextUser),
  });

  const notificationMutation = useMutation({
    mutationFn: usersApi.saveNotifications,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Settings</h1>
          <p className="mt-2 text-sm text-[#777]">Manage your profile, password, and product notifications.</p>
        </div>

        <div className="flex gap-2 rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-1">
          {(["profile", "security", "notifications"] as const).map((item) => (
            <button
              key={item}
              className={`rounded-xl px-4 py-2 capitalize ${tab === item ? "bg-cyan-400 text-black" : "text-[#777]"}`}
              onClick={() => setTab(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "profile" ? (
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-lg font-semibold text-cyan-400">
                {initials(user?.full_name, user?.email)}
              </div>
              <div>
                <p className="text-white">{user?.email}</p>
                <p className="text-sm text-[#666]">{user?.is_verified ? "Verified" : "Not verified"}</p>
              </div>
            </div>
            <form
              className="space-y-5"
              onSubmit={profileForm.handleSubmit((values) => profileMutation.mutate(values))}
            >
              <Input label="Full name" {...profileForm.register("full_name")} />
              <Input label="Username" {...profileForm.register("username")} />
              <Input disabled label="Email" value={user?.email ?? ""} />
              <Button loading={profileMutation.isPending} type="submit">
                Save changes
              </Button>
            </form>
          </div>
        ) : null}

        {tab === "security" ? (
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <h2 className="text-xl font-semibold text-white">Security</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Current password" type="password" />
              <Input label="New password" type="password" />
              <Input label="Confirm new password" type="password" />
            </div>
            <Button className="mt-5">Change password</Button>
            <div className="mt-8 border-t border-[#1e1e1e] pt-6">
              <p className="text-white">Connected Accounts</p>
              <p className="mt-2 text-sm text-[#777]">GitHub account linking can plug into the existing OAuth flow.</p>
            </div>
          </div>
        ) : null}

        {tab === "notifications" ? (
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
            <div className="space-y-4">
              {["Email updates", "Product announcements", "Weekly digest"].map((label) => (
                <label key={label} className="flex items-center justify-between rounded-xl border border-[#1e1e1e] bg-[#111] px-4 py-4">
                  <span className="text-sm text-white">{label}</span>
                  <input type="checkbox" />
                </label>
              ))}
            </div>
            <Button className="mt-6" loading={notificationMutation.isPending} onClick={() => notificationMutation.mutate({ marketing: true })}>
              Save preferences
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
