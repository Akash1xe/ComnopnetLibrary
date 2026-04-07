import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code2, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import * as authApi from "../../api/auth";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { applyServerErrors } from "../../lib/formErrors";
import { useAuthStore } from "../../stores/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [inlineError, setInlineError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect") ?? "/dashboard";
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
  }

  async function onSubmit(values: FormValues) {
    setInlineError("");

    try {
      const response = await authApi.login(values);
      setAuth(response.user, response.access_token, response.refresh_token);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setInlineError("Invalid email or password");
          return;
        }
        if (error.response?.status === 429) {
          setInlineError("Too many attempts. Try again in X minutes.");
          return;
        }
        if (Array.isArray(error.response?.data?.detail)) {
          applyServerErrors(error.response.data.detail, setError);
        }
      }
    }
  }

  async function handleGithub() {
    const { auth_url } = await authApi.getGithubAuthUrl();
    window.location.href = auth_url;
  }

  return (
    <AuthLayout
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link className="text-cyan-400" to="/register">
            Create one
          </Link>
        </>
      }
      subtitle="Sign in to save collections, copy code, and unlock premium components."
      title="Welcome back"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          autoComplete="email"
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        <div className="space-y-2">
          <PasswordInput
            autoComplete="current-password"
            error={errors.password?.message}
            label="Password"
            placeholder="Enter your password"
            {...register("password")}
          />
          <div className="text-right">
            <Link className="text-sm text-cyan-400" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
        </div>
        {inlineError ? <p className="text-sm text-red-400">{inlineError}</p> : null}
        <Button fullWidth loading={isSubmitting} type="submit">
          Sign in
        </Button>
        <div className="relative text-center text-sm text-[#666]">
          <div className="absolute inset-x-0 top-1/2 border-t border-[#1e1e1e]" />
          <span className="relative bg-[#111] px-3">or</span>
        </div>
        <Button fullWidth type="button" variant="secondary" onClick={handleGithub}>
          <Code2 className="h-4 w-4" />
          Continue with GitHub
        </Button>
      </form>
    </AuthLayout>
  );
}
