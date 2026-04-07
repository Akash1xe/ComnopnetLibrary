import { CircleX, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../../api/auth";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";

export default function GithubCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Missing GitHub callback parameters.");
      return;
    }

    authApi
      .githubCallback(code, state)
      .then((response) => {
        setAuth(response.user, response.access_token, response.refresh_token);
        navigate(response.is_new_user ? "/dashboard?welcome=true" : "/dashboard", { replace: true });
      })
      .catch(() => setError("We couldn’t connect your GitHub account."));
  }, [navigate, searchParams, setAuth]);

  return (
    <AuthLayout title="GitHub authentication" subtitle="Connecting GitHub...">
      {error ? (
        <div className="space-y-4 text-center">
          <CircleX className="mx-auto h-10 w-10 text-red-400" />
          <p className="text-sm text-[#ddd]">{error}</p>
          <Link to="/login">
            <Button>Back to login</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-[#888]">Connecting GitHub...</p>
        </div>
      )}
    </AuthLayout>
  );
}
