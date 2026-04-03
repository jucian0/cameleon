import { IconPlus } from "@intentui/icons";
import { Badge } from "app/components/ui/badge";
import { buttonStyles, Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Menu } from "app/components/ui/menu";
import { Link } from "app/components/ui/link";
import { createServerSupabase } from "app/modules/supabase/supabase-server";
import { SwaggerIcon } from "app/components/icons/swagger";
import type { LoaderFunctionArgs } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  History,
  LayoutTemplate,
  Library,
  Rocket,
  Workflow,
} from "lucide-react";

export function meta() {
  return [
    { title: "Workspace | Cameleon" },
    {
      name: "description",
      content:
        "Workspace home for workflows, templates, version history, and Camel library browsing.",
    },
  ];
}

export const handle = {
  breadcrumb: () => "Home",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id ?? null;

  const [workflowCountResult, starterCountResult, templateCountResult] =
    await Promise.all([
      supabase
        .from("workflows")
        .select("*", { count: "exact", head: true })
        .eq("owner", userId ?? ""),
      supabase
        .from("workflows")
        .select("*", { count: "exact", head: true })
        .eq("visibility", "public"),
      supabase
        .from("workflow_templates")
        .select("*", { count: "exact", head: true })
        .or(`owner.is.null,owner.eq.${userId ?? ""}`),
    ]);

  return {
    user: currentUser.data.user,
    metrics: {
      personalWorkflows: workflowCountResult.count ?? 0,
      starterWorkflows: starterCountResult.count ?? 0,
      templates: templateCountResult.count ?? 0,
    },
  };
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className="border-border/50 bg-gradient-card">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-fg">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-fg">{hint}</p>
      </CardContent>
    </Card>
  );
}

function EntryCard({
  icon: Icon,
  title,
  description,
  href,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  badge: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-gradient-card transition-all duration-300 hover:border-primary/50 hover:shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-secondary/40">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <Badge intent="secondary">{badge}</Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-sm text-muted-fg">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <Link
          href={href}
          className={buttonStyles({
            intent: "plain",
            className: "px-0 text-primary hover:text-primary",
            size: "sm",
          })}
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function HomePage({
  loaderData,
}: {
  loaderData: {
    user: {
      email?: string;
      user_metadata?: { name?: string };
    } | null;
    metrics: {
      personalWorkflows: number;
      starterWorkflows: number;
      templates: number;
    };
  };
}) {
  const displayName =
    loaderData.user?.user_metadata?.name ||
    loaderData.user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-border/50 bg-gradient-card">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge intent="secondary">Workspace</Badge>
              <Badge intent="outline">Apache Camel</Badge>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Welcome back, {displayName}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-fg">
                This is the fastest starting point for the product: create a
                workflow, begin from a template, inspect Camel building blocks,
                and continue from the last versioned route state.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Menu>
                <Menu.Trigger className={buttonStyles({ intent: "primary" })}>
                  <IconPlus />
                  New workflow
                </Menu.Trigger>
                <Menu.Content placement="bottom">
                  <Menu.Item href="/app/camel/workflows/create">
                    Blank workflow
                  </Menu.Item>
                  <Menu.Item href="/app/camel/workflows/create?mode=template">
                    Start from template
                  </Menu.Item>
                  <Menu.Item href="/app/camel/workflows/import">
                    Import Camel YAML
                  </Menu.Item>
                </Menu.Content>
              </Menu>
              <Link href="/app/camel/workflows">
                <Button intent="secondary">
                  <Workflow className="h-4 w-4" />
                  Open workflows
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard
            label="Personal workflows"
            value={loaderData.metrics.personalWorkflows}
            hint="Editable workflows in your workspace."
          />
          <MetricCard
            label="Starter workflows"
            value={loaderData.metrics.starterWorkflows}
            hint="Public examples available for study and cloning."
          />
          <MetricCard
            label="Templates"
            value={loaderData.metrics.templates}
            hint="System and custom templates available to start faster."
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            Core entry points
          </h2>
          <p className="text-sm text-muted-fg">
            The main surfaces of the product, organized around workflow design.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <EntryCard
            icon={Workflow}
            badge="Studio"
            title="Workflows"
            description="Open, create, import, clone, and manage Camel workflows in one place."
            href="/app/camel/workflows"
          />
          <EntryCard
            icon={LayoutTemplate}
            badge="Templates"
            title="Template library"
            description="Start new routes from reusable templates and manage your custom ones."
            href="/app/camel/library/templates"
          />
          <EntryCard
            icon={Library}
            badge="Library"
            title="EIPs and Components"
            description="Browse Camel metadata with details before using blocks in the editor."
            href="/app/camel/library/eips"
          />
          <EntryCard
            icon={SwaggerIcon}
            badge="API"
            title="API Studio"
            description="Design REST resources and operations with generated OpenAPI output."
            href="/app/apis"
          />
          <EntryCard
            icon={History}
            badge="Reliability"
            title="Versioned editing"
            description="Use autosave for draft safety and create explicit versions when a flow matters."
            href="/app/camel/workflows"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/50 bg-background/70">
          <CardHeader className="space-y-3">
            <Badge intent="outline">Product flow</Badge>
            <CardTitle className="text-2xl">
              How the workspace is meant to be used
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/50">
                  <LayoutTemplate className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Start from a template or starter
                  </p>
                  <p className="mt-1 text-sm text-muted-fg">
                    Use templates when you want structure from the start rather
                    than an empty route.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/50">
                  <Boxes className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Explore EIPs and components
                  </p>
                  <p className="mt-1 text-sm text-muted-fg">
                    Library pages help you inspect the available building blocks
                    before using them in a workflow.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/50">
                  <Rocket className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Move fast, keep trust
                  </p>
                  <p className="mt-1 text-sm text-muted-fg">
                    Author visually, inspect YAML, autosave drafts, and create
                    versions only when the route deserves a milestone.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 bg-gradient-card">
          <CardHeader className="space-y-3">
            <Badge intent="secondary">Suggested path</Badge>
            <CardTitle className="text-2xl">
              Go where the work actually starts
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/app/camel/workflows/create?mode=template">
              <Button className="w-full justify-between" size="lg">
                Start from template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/camel/workflows/import">
              <Button
                intent="secondary"
                className="w-full justify-between"
                size="lg"
              >
                Import YAML
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/camel/library/templates">
              <Button
                intent="plain"
                className="w-full justify-between"
                size="lg"
              >
                Browse templates
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/camel/library/components">
              <Button
                intent="plain"
                className="w-full justify-between"
                size="lg"
              >
                Open component library
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
