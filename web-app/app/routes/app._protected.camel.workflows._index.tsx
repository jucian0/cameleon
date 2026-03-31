import { buttonStyles } from "app/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "app/components/ui/toggle-group";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import {
  CopyPlus,
  Grid2X2,
  LayoutTemplate,
  List,
  Plus,
  Upload,
} from "lucide-react";
import { SearchField } from "app/components/ui/search-field";
import { Outlet, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { Link } from "app/components/ui/link";
import { CamelCard } from "@/camel/workflows-components/card";
import type { CamelConfig } from "@/modules/supabase/supabase-db";
import { Menu } from "app/components/ui/menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .or(`owner.eq.${user?.id ?? ""},visibility.eq.public`);
  const currentUserId = user?.id ?? null;
  return { data: data ?? [], error, currentUserId };
}

export async function action({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const id = formData.get("id");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (action === "delete" && id) {
    const workflow = await supabase
      .from("workflows")
      .select("id, owner")
      .eq("id", id)
      .maybeSingle();

    if (workflow.error) {
      throw new Error(`Failed to load workflow: ${workflow.error.message}`);
    }

    if (!workflow.data) {
      throw new Error("Workflow not found.");
    }

    if (!user?.id || workflow.data.owner !== user.id) {
      throw new Error("You do not have permission to delete this workflow.");
    }

    const { error } = await supabase.from("workflows").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  }
  return { success: true };
}

const filterItems = (
  items: CamelConfig[],
  searchParams: URLSearchParams,
  currentUserId: string | null,
) => {
  return items
    ?.filter((item) => {
      const query = searchParams.get("query")?.toLowerCase();
      const onlyMine = searchParams.get("onlyMine") === "true";

      if (onlyMine && item.owner !== currentUserId) return false;

      if (query) {
        const haystack = [item.name, item.description ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (searchParams.get("sort") === "name") {
        return a.name.localeCompare(b.name);
      }
      if (searchParams.get("sort") === "updatedAt") {
        return Number(new Date(b.updated_at)) - Number(new Date(a.updated_at));
      }
      return 0;
    });
};

function renderWorkflowSection({
  title,
  description,
  items,
  currentUserId,
  viewMode,
}: {
  title: string;
  description: string;
  items: CamelConfig[];
  currentUserId: string | null;
  viewMode: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge intent="secondary">
          {items.length} workflow{items.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <div
        className={
          viewMode === "cards"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {items.map((workflow) => (
          <CamelCard
            key={workflow.id}
            camelConfig={workflow}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </section>
  );
}

export default function CamelWorkflows({
  loaderData,
}: {
  loaderData: { data: CamelConfig[]; currentUserId: string | null };
}) {
  const items = loaderData.data;
  const { currentUserId } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  function handleSearchChange(params: { [key: string]: string }) {
    const currentSearchParams = Object.fromEntries(searchParams);
    setSearchParams({ ...currentSearchParams, ...params });
  }

  const filteredItems = filterItems(items ?? [], searchParams, currentUserId);
  const totalWorkflows = filteredItems.length;
  const viewMode = searchParams.get("view") || "cards";
  const onlyMine = searchParams.get("onlyMine") === "true";
  const starterCount = filteredItems.filter(
    (workflow) => workflow.visibility === "public",
  ).length;
  const personalCount = totalWorkflows - starterCount;
  const personalItems = filteredItems.filter(
    (workflow) => workflow.visibility === "private",
  );
  const starterItems = filteredItems.filter(
    (workflow) => workflow.visibility === "public",
  );
  const hasQuery = Boolean(searchParams.get("query"));

  return (
    <div className="m-6 flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground">{metaData.description}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {totalWorkflows} workflow{totalWorkflows !== 1 ? "s" : ""} total
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {personalCount} personal, {starterCount} starter
          {starterCount === 1 ? "" : "s"}
        </p>
      </div>
      <form className="mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:w-1/2">
              <SearchField
                className="w-full max-w-96"
                aria-label="Search"
                placeholder="Search workflows by name or description"
                defaultValue={searchParams.get("query") || ""}
                onChange={(e) => handleSearchChange({ query: e })}
              />
              <Select
                className="flex-1"
                defaultSelectedKey={searchParams.get("sort") ?? "updatedAt"}
                onSelectionChange={(v) =>
                  handleSearchChange({ sort: v?.toString() ?? "" })
                }
              >
                <SelectTrigger className="w-40" aria-label="Sort by" />
                <SelectList>
                  <SelectOption id="updatedAt">Recent first</SelectOption>
                  <SelectOption id="name">Name A-Z</SelectOption>
                </SelectList>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <ToggleGroup
                size="lg"
                selectionMode="single"
                defaultSelectedKeys={[searchParams.get("view") ?? "cards"]}
                onSelectionChange={(v) =>
                  handleSearchChange({
                    view: v.values().next().value?.toString() ?? "",
                  })
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
              <Menu>
                <Menu.Trigger
                  className={buttonStyles({
                    size: "md",
                    intent: "primary",
                  })}
                >
                  <Plus className="h-4 w-4" />
                  New Workflow
                </Menu.Trigger>
                <Menu.Content placement="bottom end">
                  <Menu.Item href="/app/camel/workflows/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create blank workflow
                  </Menu.Item>
                  <Menu.Item href="/app/camel/workflows/create?mode=template">
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    Start from template
                  </Menu.Item>
                  <Menu.Item href="/app/camel/workflows/create?mode=clone">
                    <CopyPlus className="mr-2 h-4 w-4" />
                    Clone existing workflow
                  </Menu.Item>
                  <Menu.Item href="/app/camel/workflows/import">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Camel YAML
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </div>
          <div className="flex items-center">
            <Checkbox
              isSelected={onlyMine}
              onChange={(isSelected) =>
                handleSearchChange({
                  onlyMine: isSelected ? "true" : "false",
                })
              }
            >
              Only mine
            </Checkbox>
          </div>
        </div>
      </form>
      {totalWorkflows === 0 ? (
        <section className="rounded-2xl border border-dashed border-border px-6 py-8">
          <h2 className="text-base font-semibold text-foreground">
            {hasQuery ? "No workflows match this search" : "No workflows yet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasQuery
              ? "Try a different name, clear the Only mine filter, or search by description."
              : "Start from scratch, use a starter template, or import existing Camel YAML."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/app/camel/workflows/create"
              className={buttonStyles({ intent: "primary", size: "sm" })}
            >
              Create blank workflow
            </Link>
            <Link
              href="/app/camel/workflows/create?mode=template"
              className={buttonStyles({ intent: "secondary", size: "sm" })}
            >
              Start from template
            </Link>
            <Link
              href="/app/camel/workflows/create?mode=clone"
              className={buttonStyles({ intent: "secondary", size: "sm" })}
            >
              Clone existing workflow
            </Link>
            <Link
              href="/app/camel/workflows/import"
              className={buttonStyles({ intent: "secondary", size: "sm" })}
            >
              Import Camel YAML
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-8" aria-label="Workflows library">
          {renderWorkflowSection({
            title: "Personal Workflows",
            description: "Your editable workflows and drafts.",
            items: personalItems,
            currentUserId,
            viewMode,
          })}
          {renderWorkflowSection({
            title: "Starter Workflows",
            description: "Reference workflows you can inspect and duplicate.",
            items: starterItems,
            currentUserId,
            viewMode,
          })}
        </section>
      )}
      <Outlet />
    </div>
  );
}
