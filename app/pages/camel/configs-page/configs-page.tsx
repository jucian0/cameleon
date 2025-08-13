export const handle = {
  breadcrumb: () => "Camel Studio",
};

import { useMemo, useState } from "react";
import { Button, buttonStyles } from "components/ui/button";
import { Badge } from "components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "components/ui/toggle-group";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "components/ui/select";
import { ScrollArea } from "components/ui/scroll-area";
import {
  DeleteIcon,
  Grid2X2,
  List,
  Plus,
  Search,
  Settings2,
  Trash,
  Workflow,
} from "lucide-react";
import { SearchField } from "components/ui/search-field";
import type { LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { Route } from "./+types/configs-page";
import type { CamelConfig } from "../topology-lib/topology-types";
import { Link } from "components/ui/link";

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

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);

  // get the config with the latest version
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

  return { data, error };
}

export default function CamelConfigs({ loaderData }: Route.ComponentProps) {
  const items = loaderData.data;
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [sort, setSort] = useState<"name" | "updatedAt">("updatedAt");

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
            {items?.map((c) => (
              <Link href={`/camel/configs/${c.id}`} key={c.id}>
                <Card
                  key={c.id}
                  className="transition shadow-sm hover:shadow-md focus-within:ring-2 ring-ring h-50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">
                        {c.name} <span>v{c.latest_version[0].version}</span>
                      </CardTitle>
                      <StatusBadge status={c.latest_version[0].status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(
                          c.latest_version[0].updated_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {c.latest_version[0].description} description goes here.
                      And not here...
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {c.tags.slice(0, 3).map((t) => (
                        <Badge key={t} intent="outline">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
