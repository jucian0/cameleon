export const handle = {
  breadcrumb: () => "Camel Studio",
};

import { useMemo, useState } from "react";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "components/ui/toggle-group";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "components/ui/select";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { Grid2X2, List, Plus, Search, Settings2 } from "lucide-react";
import { Input } from "components/ui/field";
import { SearchField } from "components/ui/search-field";
import type { Key } from "react-stately";
import type { LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { Route } from "./+types/configs-page";

export type CamelConfig = {
  id: string;
  name: string;
  version: string;
  status: "active" | "deprecated" | "draft";
  updatedAt: string;
  description: string;
  tags: string[];
  owner: string;
  environment: "dev" | "staging" | "prod";
};

const SAMPLE_CONFIGS: CamelConfig[] = [
  {
    id: "cfg-001",
    name: "Order Routing",
    version: "1.8.3",
    status: "active",
    updatedAt: "2025-07-08",
    description:
      "Routes purchase orders to the appropriate regional topic based on country and SLA.",
    tags: ["orders", "routing", "kafka"],
    owner: "integration@acme.io",
    environment: "prod",
  },
  {
    id: "cfg-002",
    name: "Invoice Normalizer",
    version: "2.1.0",
    status: "active",
    updatedAt: "2025-06-20",
    description:
      "Normalizes invoice payloads and enriches with account metadata.",
    tags: ["finance", "enrichment"],
    owner: "finops@acme.io",
    environment: "staging",
  },
  {
    id: "cfg-003",
    name: "Warehouse Events",
    version: "0.9.2",
    status: "draft",
    updatedAt: "2025-08-01",
    description: "Publishes warehouse sensor events to telemetry bus.",
    tags: ["iot", "telemetry"],
    owner: "ops@acme.io",
    environment: "dev",
  },
  {
    id: "cfg-004",
    name: "Returns Processor",
    version: "1.0.5",
    status: "active",
    updatedAt: "2025-05-14",
    description:
      "Handles return requests and triggers warehouse restock workflow.",
    tags: ["returns", "workflow"],
    owner: "ops@acme.io",
    environment: "prod",
  },
  {
    id: "cfg-005",
    name: "Contract Sync",
    version: "3.2.1",
    status: "deprecated",
    updatedAt: "2025-03-03",
    description: "Legacy route for syncing contracts from CRM to ERP.",
    tags: ["crm", "erp", "legacy"],
    owner: "platform@acme.io",
    environment: "staging",
  },
  {
    id: "cfg-006",
    name: "Shipment Tracker",
    version: "2.4.7",
    status: "active",
    updatedAt: "2025-07-29",
    description: "Aggregates carrier tracking events and notifies customers.",
    tags: ["shipping", "notifications"],
    owner: "logistics@acme.io",
    environment: "prod",
  },
];

function StatusBadge({ status }: { status: CamelConfig["status"] }) {
  const variant =
    status === "active"
      ? "secondary"
      : status === "draft"
        ? "outline"
        : "destructive";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge variant={variant}>{label}</Badge>;
}

function EnvBadge({ env }: { env: CamelConfig["environment"] }) {
  const map: Record<
    CamelConfig["environment"],
    "outline" | "secondary" | "default"
  > = {
    dev: "outline",
    staging: "secondary",
    prod: "default",
  };
  return <Badge intent={map[env]}>{env.toUpperCase()}</Badge>;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { configId } = params;
  const { supabase } = createServerSupabase(request);

  const { data, error } = await supabase.from("camel_config_projects").select(`
      id,
      name,
      owner,
      tags,
      environment,
      latest_version:camel_config_latest_versions (
        version,
        status,
        updated_at,
        description,
        content
      )
    `);

  console.log({ data, error });
  // if (error) {
  //   console.error(error);
  //   throw new Response("Failed to fetch config", { status: 500 });
  // }

  // if (!data) {
  //   throw new Response("Config not found", { status: 404 });
  // }

  return {};
}

export default function CamelConfigs({ loaderData }: Route.ComponentProps) {
  const data = loaderData;
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [sort, setSort] = useState<"name" | "updatedAt">("updatedAt");

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = SAMPLE_CONFIGS.filter((c) =>
      [
        c.name,
        c.description,
        c.owner,
        c.tags.join(" "),
        c.environment,
        c.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return sorted;
  }, [query, sort]);

  return (
    <div className="m-6 flex flex-col gap-4">
      <form className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full">
            <SearchField
              className="w-full max-w-96"
              aria-label="Search"
              placeholder="Search"
              value={query}
              onChange={setQuery}
            />
            <Select
              className="flex-1"
              selectedKey={sort}
              onSelectionChange={(v: any) => setSort(v)}
            >
              <SelectTrigger className="w-40" aria-label="Sort by" />
              <SelectList>
                <SelectOption id="updatedAt">Recent first</SelectOption>
                <SelectOption id="name">Name A–Z</SelectOption>
              </SelectList>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2">
            <ToggleGroup
              selectionMode="single"
              selectedKeys={view}
              onSelectionChange={(v) => v && setView(v as any)}
              aria-label="View mode"
            >
              <ToggleGroupItem id="cards" aria-label="Cards view">
                <Grid2X2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem id="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Button intent="primary" size="lg" aria-label="Settings">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {view === "cards" ? (
        <section aria-label="Configs grid">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Card
                key={c.id}
                className="transition shadow-sm hover:shadow-md focus-within:ring-2 ring-ring"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">
                      {c.name}
                    </CardTitle>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>v{c.version}</span>·
                    <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {c.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <EnvBadge env={c.environment} />
                    {c.tags.slice(0, 3).map((t) => (
                      <Badge key={t} intent="outline">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <section aria-label="Configs list">
          <ScrollArea className="w-full"></ScrollArea>
        </section>
      )}
    </div>
  );
}
