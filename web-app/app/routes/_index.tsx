import { Badge } from "app/components/ui/badge";
import { Button } from "app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Code2,
  Github,
  History,
  LayoutTemplate,
  Library,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Link } from "react-router";

const metadata = {
  title: "Cameleon",
  description:
    "Visual product workspace for Apache Camel. Design routes, start from templates, inspect EIPs and components, and keep workflows stable from draft to versioned delivery.",
  githubUrl: "https://github.com/jucian0/cameleon",
};

export function meta() {
  return [
    { title: `${metadata.title} | Visual Product Workspace for Apache Camel` },
    { name: "description", content: metadata.description },
  ];
}

function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-gradient-card shadow-sm">
      <svg
        viewBox="0 0 31.637 31.637"
        className="h-6 w-6 text-foreground"
        fill="currentColor"
      >
        <circle cx="7.676" cy="7.067" r="0.827" />
        <path d="M21.841,4.244c-4-1.012-7.198-0.758-11.431,1.771c-0.097-0.924-2.53-3.697-5.497-1.75 C1.751,3.874,1.751,7.134,1.751,7.134S0.023,10.173,0,11.318c-0.016,0.766,0.446,0.973,0.888,1.105 c2.285-1.301,4.359-0.992,6.044-0.74c0.878,0.131,1.639,0.242,2.208,0.082c0.197-0.057,0.404,0.06,0.46,0.258 c0.056,0.197-0.06,0.404-0.257,0.461c-0.724,0.203-1.557,0.08-2.521-0.064c-1.508-0.225-3.35-0.486-5.328,0.535 c1.878,3.272,7.082,4.382,10.862,1.769c0.825,0.052,1.907,0.175,3.074,0.271c0.215,0.017,0.004,0.697-0.205,1.375 c-0.073,0.236-2.863,0.82-2.918,1.027c-0.101,0.389,2.537,0.072,2.725,0.341c0.187,0.271-0.34,1.509-0.097,2.094 c0.162,0.389,1.48-0.011,1.849-0.926c0.186-0.456-0.593-1.359-0.42-1.722c0.52-1.083,0.974-2.073,1.055-2.071 c0.541,0.017,1.08,0.018,1.604-0.007c1.092-0.05,2.146-0.152,3.122-0.237c0.124-0.011,0.332,0.425,0.552,0.933 c0.1,0.232-1.828,0.584-1.729,0.812c0.203,0.466,1.897,0.152,2.529,0.734c0.633,0.584,0.653,2.156,1.119,2.336 c0.257,0.099,1.334-0.674,1.119-1.654c-0.314-1.43-2.036-3.274-1.946-3.278c1.195-0.055,2.188,0.002,2.87,0.355 c2.53,1.309,0.682,11.047-5.643,11.535c-3.445,0.265-4.596-2.491-4.168-4.028c0.423-1.519,2.319-2.345,3.634-2.148 c1.312,0.192,1.556,1.41,0.973,2.235c-0.077,0.109-0.166,0.21-0.261,0.304c-0.226-0.229-0.538-0.371-0.884-0.371 c-0.687,0-1.242,0.557-1.242,1.242c0,0.687,0.556,1.241,1.242,1.241c0.62,0,1.13-0.455,1.223-1.052 c0.334-0.083,0.664-0.245,0.944-0.536c1.118-1.168,0.875-3.26-1.244-3.978c-2.371-0.802-5.694,0.688-5.792,3.218 c-0.097,2.529,2.224,5.496,6.221,5.268c5.935-0.342,10.204-6.504,9.965-12.192C31.421,11.026,28.847,6.015,21.841,4.244z M6.922,9.713c-1.33,0-2.408-1.078-2.408-2.408c0-1.33,1.078-2.408,2.408-2.408c1.329,0,2.407,1.078,2.407,2.408 C9.33,8.635,8.252,9.713,6.922,9.713z" />
      </svg>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function ProductCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
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
    </Card>
  );
}

function FlowStep({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-secondary/40">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
    </div>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-5">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-fg">{label}</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(90,212,221,0.12),transparent_35%),linear-gradient(180deg,var(--color-bg),color-mix(in_oklab,var(--color-bg)_88%,var(--color-secondary)))]">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-semibold text-foreground">Cameleon</p>
              <p className="text-xs text-muted-fg">Visual Camel Workspace</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/app/camel/workflows">Workflows</NavLink>
            <NavLink href="/app/camel/library/templates">Templates</NavLink>
            <NavLink href="/app/camel/library/eips">Library</NavLink>
            <a
              href={metadata.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={metadata.githubUrl} target="_blank" rel="noreferrer">
              <Button intent="plain" size="sq-sm" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </Button>
            </a>
            <Link to="/app">
              <Button size="sm">
                Open app
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge intent="secondary">
                <Sparkles className="h-3 w-3" />
                Product workspace for Apache Camel
              </Badge>
              <Badge intent="outline">Open source</Badge>
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Build Camel workflows like a product, not a pile of route files.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-fg">
                Start from templates, design visually, inspect EIPs and
                components, autosave drafts, and create versions when the flow
                becomes worth keeping.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/app">
                <Button size="lg">
                  <Rocket className="h-5 w-5" />
                  Open Studio
                </Button>
              </Link>
              <Link to="/app/camel/library/templates">
                <Button intent="secondary" size="lg">
                  <LayoutTemplate className="h-5 w-5" />
                  Browse templates
                </Button>
              </Link>
            </div>
            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              <Metric value="Visual" label="Canvas + code editing" />
              <Metric value="Stable" label="Autosave and version history" />
              <Metric value="Reusable" label="Templates and starters" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Camel Studio
                  </p>
                  <p className="text-xs text-muted-fg">
                    From starter to versioned workflow
                  </p>
                </div>
                <Badge intent="success">Synced</Badge>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/50">
                        <LayoutTemplate className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Start from template
                        </p>
                        <p className="text-xs text-muted-fg">
                          REST to Bean Response
                        </p>
                      </div>
                    </div>
                    <Badge intent="warning">System</Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Workflow structure
                    </p>
                    <Badge intent="secondary">Authoring</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <div className="h-9 flex-1 rounded-xl border border-border/60 bg-secondary/30" />
                    </div>
                    <div className="ml-6 flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-workflow-connection" />
                      <div className="h-9 flex-1 rounded-xl border border-border/60 bg-secondary/20" />
                    </div>
                    <div className="ml-12 grid grid-cols-2 gap-3">
                      <div className="h-16 rounded-2xl border border-border/60 bg-secondary/20" />
                      <div className="h-16 rounded-2xl border border-border/60 bg-secondary/20" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Version history
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-fg">
                      Drafts autosave. Important states become explicit versions.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Stability
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-fg">
                      Safer load, parse and reopen flows with recovery states.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Badge intent="outline">Core product</Badge>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Everything around the workflow, not just the canvas
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProductCard
              icon={Workflow}
              badge="Studio"
              title="Visual authoring"
              description="Edit Camel routes through a canvas that understands structural operators like choice and doTry."
            />
            <ProductCard
              icon={Code2}
              badge="Code"
              title="YAML round-trip"
              description="Move between visual and code modes while keeping the stored workflow format predictable."
            />
            <ProductCard
              icon={LayoutTemplate}
              badge="Templates"
              title="Template-driven starts"
              description="Use system starters and your own saved templates as repeatable starting points."
            />
            <ProductCard
              icon={Library}
              badge="Library"
              title="Metadata browsing"
              description="Inspect EIPs and Components with dedicated library views instead of guessing field shapes."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-border/60 bg-background/70 p-6 sm:p-8">
            <div className="max-w-3xl">
              <Badge intent="outline">Workflow loop</Badge>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Start, shape, validate, version
              </h2>
              <p className="mt-3 text-base text-muted-fg">
                Cameleon is strongest when the workflow is treated like a product
                artifact: you start from something solid, iterate safely, and
                checkpoint meaningful moments instead of trusting ad-hoc files.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FlowStep
                icon={LayoutTemplate}
                title="1. Start from a template"
                description="Pick a practical starter from the template library instead of starting from an empty canvas every time."
              />
              <FlowStep
                icon={Boxes}
                title="2. Explore the building blocks"
                description="Browse EIPs and Components with metadata-first details before inserting them into a workflow."
              />
              <FlowStep
                icon={Workflow}
                title="3. Shape the route visually"
                description="Use authoring-safe structures, filtered placeholders, and inline validation while editing."
              />
              <FlowStep
                icon={History}
                title="4. Create versions"
                description="Autosave keeps the draft safe. Version history captures the milestones that matter."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden border-border/50 bg-gradient-card">
              <CardHeader className="space-y-4">
                <Badge intent="secondary">Where to begin</Badge>
                <CardTitle className="text-2xl">
                  Jump into the real product surface
                </CardTitle>
                <p className="text-sm text-muted-fg">
                  The fastest path is to open the app, pick a template, and let
                  the studio guide the structure instead of building route YAML
                  from scratch.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link to="/app">
                  <Button size="lg" className="w-full justify-between">
                    Open app
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/app/camel/library/templates">
                  <Button intent="secondary" size="lg" className="w-full justify-between">
                    Open templates
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-background/70">
              <CardHeader className="space-y-4">
                <Badge intent="outline">Open source</Badge>
                <CardTitle className="text-2xl">
                  Product direction stays visible in the code
                </CardTitle>
                <p className="text-sm text-muted-fg">
                  Cameleon is built in the open and shaped around real workflow
                  authoring problems: editor trust, route structure, templates,
                  versioning, and library discoverability.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <a href={metadata.githubUrl} target="_blank" rel="noreferrer">
                  <Button intent="secondary" size="lg">
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </Button>
                </a>
                <a
                  href={`${metadata.githubUrl}/issues`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button intent="plain" size="lg">
                    <BookOpen className="h-5 w-5" />
                    Follow issues
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
