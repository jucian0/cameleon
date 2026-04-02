import { createClient } from "@/modules/supabase/supabase-client";
import { Badge } from "app/components/ui/badge";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(90,212,221,0.1),transparent_30%),var(--color-bg)] px-4">
      <Card className="w-full max-w-lg border-border/60 bg-background/95 shadow-card backdrop-blur-xl">
        <CardHeader className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-secondary/40">
            {error ? (
              <AlertTriangle className="h-6 w-6 text-warning" />
            ) : (
              <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
          <div className="space-y-2 pt-6">
            <CardTitle className="text-3xl tracking-tight">
              {error ? "Sign-in needs attention" : "Signing you in"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-fg">
              {error
                ? "Authentication could not be completed in this browser session."
                : "Completing authentication and returning you to the workspace."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
          {error ? (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
              <Badge intent="warning">Authentication error</Badge>
              <p className="mt-3 text-sm text-foreground">{error}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-fg">
              Waiting for the OAuth session to settle. This usually takes only a
              moment.
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              to="/app/auth"
              className="text-sm text-muted-fg transition-colors hover:text-foreground"
            >
              Back to sign in
            </Link>
            {error && (
              <Button
                intent="secondary"
                onPress={() => navigate("/app/auth", { replace: true })}
              >
                Try again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
