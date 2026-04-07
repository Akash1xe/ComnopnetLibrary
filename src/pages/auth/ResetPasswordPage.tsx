import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import * as authApi from "../../api/auth";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";

const schema = z
  .object({
    password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d).+$/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <AuthLayout title="Reset password">
        <p className="text-sm text-red-400">This link has expired.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout subtitle="Choose a new password for your account." title="Reset password">
      {success ? (
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-white">Password updated!</p>
          <p className="text-sm text-[#888]">Redirecting you to login.</p>
        </div>
      ) : expired ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-400">This link has expired.</p>
          <Link to="/forgot-password">
            <Button>Request a new reset link</Button>
          </Link>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit(async ({ password }) => {
            try {
              await authApi.resetPassword(token, password);
              setSuccess(true);
              window.setTimeout(() => navigate("/login", { replace: true }), 2000);
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.status === 401) {
                setExpired(true);
              }
            }
          })}
        >
          <PasswordInput error={errors.password?.message} label="New password" {...register("password")} />
          <PasswordInput error={errors.confirmPassword?.message} label="Confirm password" {...register("confirmPassword")} />
          <Button fullWidth loading={isSubmitting} type="submit">
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
