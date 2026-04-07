import { CheckCircle2, CircleX, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../../api/auth";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const setAuth = useAuthStore((state) => state.setAuth);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((response) => {
        setAuth(response.user, response.access_token, response.refresh_token);
        setState("success");
        window.setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
      })
      .catch(() => setState("error"));
  }, [navigate, setAuth, token]);

  return (
    <AuthLayout title="Email verification" subtitle="We’re confirming your account now.">
      {state === "loading" ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-[#888]">Verifying your email...</p>
        </div>
      ) : null}
      {state === "success" ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-lg font-semibold text-white">Email verified!</p>
          <p className="text-sm text-[#888]">You&apos;re being redirected to your dashboard.</p>
        </div>
      ) : null}
      {state === "error" ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CircleX className="h-10 w-10 text-red-400" />
          <p className="text-lg font-semibold text-white">Invalid or expired link</p>
          <Link to="/forgot-password">
            <Button>Request new link</Button>
          </Link>
        </div>
      ) : null}
    </AuthLayout>
  );
}
