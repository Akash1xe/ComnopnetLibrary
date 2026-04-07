import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import * as authApi from "../../api/auth";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      footer={
        <Link className="text-cyan-400" to="/login">
          Back to login
        </Link>
      }
      subtitle="Enter your email and we’ll send you a reset link if the account exists."
      title="Forgot password"
    >
      {submitted ? (
        <p className="text-sm text-[#bbb]">If that email exists, we sent a reset link.</p>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit(async ({ email }) => {
            await authApi.forgotPassword(email);
            setSubmitted(true);
          })}
        >
          <Input
            error={errors.email?.message}
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            placeholder="you@example.com"
            {...register("email")}
          />
          <Button fullWidth loading={isSubmitting} type="submit">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
