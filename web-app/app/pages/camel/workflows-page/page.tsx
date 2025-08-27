import { buttonStyles } from "app/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "app/components/ui/toggle-group";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import { Grid2X2, List, Plus } from "lucide-react";
import { SearchField } from "app/components/ui/search-field";
import { Outlet, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { Route } from "./+types/page";
import { Link } from "app/components/ui/link";
import { CamelCard } from "./components/card";

const metaData = {
  title: "Workflows | Chameleon",
  description:
    "Organize and manage your workflow diagrams with names and descriptions.",
};

export function meta() {
  return [{ title: metaData.title }, { description: metaData.description }];
}

export const handle = {
  breadcrumb: () => "Camel Studio",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const { data, error } = await supabase.from("workflows").select("*");
  return { data, error };
}

export async function action({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const id = formData.get("id");
  if (action === "delete" && id) {
    const { error } = await supabase.from("workflows").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  }
  return { success: true };
}

const filterItems = (items: any[], searchParams: URLSearchParams) => {
  return items
    ?.filter((item) => {
      const query = searchParams.get("query")?.toLowerCase();

      if (query && !item.name.toLowerCase().includes(query)) return false;

      return true;
    })
    .sort((a, b) => {
      if (searchParams.get("sort") === "name") {
        return a.name.localeCompare(b.name);
      }
      if (searchParams.get("sort") === "updatedAt") {
        return Number(new Date(a.updated_at)) - Number(new Date(b.updated_at));
      }
      return 0;
    });
};

export default function CamelWorkflows({ loaderData }: Route.ComponentProps) {
  const items = loaderData.data;
  const [searchParams, setSearchParams] = useSearchParams();

  function handleSearchChange(params: { [key: string]: any }) {
    const currentSearchParams = Object.fromEntries(searchParams);
    setSearchParams({ ...currentSearchParams, ...params });
  }

  const filteredItems = filterItems(items ?? [], searchParams);
  const totalWorkflows = filteredItems.length;
  const viewMode = searchParams.get("view") || "cards";

  return (
    <div className="m-6 flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground">{metaData.description}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {totalWorkflows} workflow{totalWorkflows !== 1 ? "s" : ""} total
        </p>
      </div>
      <form className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-1/2">
            <SearchField
              className="w-full max-w-96"
              aria-label="Search"
              placeholder="Search workflows by name"
              defaultValue={searchParams.get("query") || ""}
              onChange={(e) => handleSearchChange({ query: e })}
            />
            <Select
              className="flex-1"
              defaultSelectedKey={searchParams.get("sort") ?? "updatedAt"}
              onSelectionChange={(v: any) => handleSearchChange({ sort: v })}
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
              size="lg"
              selectionMode="single"
              defaultSelectedKeys={[searchParams.get("view") ?? "cards"]}
              onSelectionChange={(v) =>
                handleSearchChange({ view: v.values().next().value })
              }
              aria-label="View mode"
            >
              <ToggleGroupItem id="cards" aria-label="Cards view">
                <Grid2X2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem id="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Link
              href="/camel/workflows/create"
              aria-label="Settings"
              className={buttonStyles({
                size: "md",
                intent: "primary",
              })}
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </Link>
          </div>
        </div>
      </form>
      <section aria-label="Workflows grid">
        <div
          className={
            viewMode === "cards"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredItems?.map((c) => (
            <CamelCard
              key={c.id}
              id={c.id}
              name={c.name}
              description={c.description}
              lastModified={new Date(c.updated_at).toLocaleDateString()}
              nodeCount={c.workflow_id ?? 10}
            />
          ))}
        </div>
      </section>
      <Outlet />
    </div>
  );
}
