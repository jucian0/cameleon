import { createClient } from "@/modules/supabase/supabase-client";
import { IconBrandGithub } from "@intentui/icons";
import { Badge } from "app/components/ui/badge";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  History,
  LayoutTemplate,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { Link, useRouteLoaderData } from "react-router";

export function meta() {
  return [
    { title: "Sign in to Cameleon" },
    { description: "Use your GitHub account to continue" },
  ];
}

export default function AuthPage() {
  const { env } = useRouteLoaderData("root") as {
    env: {
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      ENV: string;
    };
  };

  const [supabase] = useState(() =>
    createClient(env.SUPABASE_URL, env.SUPABASE_KEY),
  );

  async function handleGithubSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/app/auth/callback?next=/app`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(90,212,221,0.12),transparent_30%),linear-gradient(180deg,var(--color-bg),color-mix(in_oklab,var(--color-bg)_90%,var(--color-secondary)))]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1fr_0.95fr] lg:gap-12 lg:px-8">
        <div className="hidden max-w-2xl space-y-8 lg:block">
          <div className="space-y-4">
            <Badge intent="secondary">Visual workspace for Apache Camel</Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-foreground">
                Sign in and continue building Camel workflows like a product.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-fg">
                Use visual authoring, YAML inspection, templates, autosave, and
                explicit versions without leaving the workspace.
              </p>
            </div>
          </div>

          <Card className="max-w-xl border-border/60 bg-background/70 shadow-sm">
            <CardHeader className="px-5 py-5">
              <CardTitle className="text-lg">
                What you get after sign-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 pt-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                  <Workflow className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Visual Studio
                  </p>
                  <p className="text-sm text-muted-fg">
                    Build routes on canvas and keep structural branches safe by
                    default.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                  <Code2 className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Code + YAML
                  </p>
                  <p className="text-sm text-muted-fg">
                    Inspect YAML directly while preserving the last valid editor
                    state.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                  <LayoutTemplate className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Templates and reuse
                  </p>
                  <p className="text-sm text-muted-fg">
                    Start from system templates or promote your own workflow
                    into reusable patterns.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Draft safety
                  </p>
                  <p className="text-sm text-muted-fg">
                    Drafts autosave continuously, while milestones stay explicit
                    in version history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <Card className="mx-auto w-full max-w-xl border-border/60 bg-background/95 shadow-card backdrop-blur-xl lg:ml-auto">
            <CardHeader className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-secondary/40">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6">
                <CardTitle className="text-3xl tracking-tight">
                  Sign in to Cameleon
                </CardTitle>
                <p className="text-sm leading-6 text-muted-fg">
                  Continue with GitHub to access your workspace, templates, and
                  workflow history.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-sm text-foreground">
                    One GitHub sign-in gives you access to workflows, templates,
                    autosave drafts, and milestone history in the same
                    workspace.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                onPress={handleGithubSignIn}
              >
                <IconBrandGithub className="w-5 h-5" />
                Continue with GitHub
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-fg">
                Your authentication returns to the current environment, so local
                and production sign-in stay aligned with the active origin.
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/"
                  className="text-muted-fg transition-colors hover:text-foreground"
                >
                  Back to home
                </Link>
                <a
                  href="https://github.com/jucian0/cameleon"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-fg transition-colors hover:text-foreground"
                >
                  View project
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
