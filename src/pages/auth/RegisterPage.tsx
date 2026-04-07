import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code2, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import * as authApi from "../../api/auth";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { PasswordStrength } from "../../components/ui/PasswordStrength";

const schema = z.object({
  full_name: z.string().optional(),
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d).+$/, "Use at least 8 chars, 1 uppercase, and 1 number"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [successEmail, setSuccessEmail] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      username: "",
      password: "",
    },
  });
  const password = useWatch({ control, name: "password" }) ?? "";

  async function onSubmit(values: FormValues) {
    try {
      const response = await authApi.register(values);
      setSuccessEmail(response.user.email);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string") {
          if (detail.toLowerCase().includes("email")) {
            setError("email", { type: "server", message: detail });
          }
          if (detail.toLowerCase().includes("username")) {
            setError("username", { type: "server", message: detail });
          }
        }
      }
    }
  }

  async function handleGithub() {
    const { auth_url } = await authApi.getGithubAuthUrl();
    window.location.href = auth_url;
  }

  if (successEmail) {
    return (
      <AuthLayout
        footer={
          <>
            Already have an account?{" "}
            <Link className="text-cyan-400" to="/login">
              Sign in
            </Link>
          </>
        }
        subtitle="We sent a verification link to finish setting up your account."
        title="Check your email!"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-400">
            <Mail className="h-7 w-7" />
          </div>
          <p className="text-sm text-[#888]">
            We sent a verification email to <span className="font-semibold text-white">{successEmail}</span>.
          </p>
          <Button fullWidth onClick={() => authApi.forgotPassword(successEmail)}>
            Resend email
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-cyan-400" to="/login">
            Sign in
          </Link>
        </>
      }
      subtitle="Create your account and start building with curated components."
      title="Create account"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full name" placeholder="John Doe" {...register("full_name")} />
        <Input
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          placeholder="you@example.com"
          {...register("email")}
        />
        <Input
          error={errors.username?.message}
          icon={<UserRound className="h-4 w-4" />}
          label="Username"
          placeholder="3-30 chars, letters, numbers, underscore"
          {...register("username")}
        />
        <div className="space-y-3">
          <PasswordInput error={errors.password?.message} label="Password" placeholder="Create a strong password" {...register("password")} />
          <PasswordStrength password={password} />
        </div>
        <Button fullWidth loading={isSubmitting} type="submit">
          Create account
        </Button>
        <Button fullWidth type="button" variant="secondary" onClick={handleGithub}>
          <Code2 className="h-4 w-4" />
          Continue with GitHub
        </Button>
      </form>
    </AuthLayout>
  );
}
