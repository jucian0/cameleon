import { createClient } from "@/modules/supabase/supabase-client";
import { useEffect, useState } from "react";
import { useNavigate, useRouteLoaderData, useSearchParams } from "react-router";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { env } = useRouteLoaderData("root") as {
    env: {
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
    };
  };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") || "/app";
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    let isActive = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        navigate(next, { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isActive) return;
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        navigate(next, { replace: true });
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [env.SUPABASE_KEY, env.SUPABASE_URL, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-lg font-semibold">Signing you in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "Completing authentication..."}
        </p>
      </div>
    </div>
  );
}
