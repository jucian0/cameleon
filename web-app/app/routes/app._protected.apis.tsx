import { RestCard } from "@/rest-studio/rest-card";
import { listApis } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { ApiRecord } from "@/modules/supabase/supabase-db";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import { SearchField } from "app/components/ui/search-field";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import { LayoutTemplate, Plus } from "lucide-react";
import {
  Outlet,
  useLocation,
  useLoaderData,
  useSearchParams,
  type LoaderFunctionArgs,
} from "react-router";

export const handle = {
  breadcrumb: () => "Rest Studio",
};

const metaData = {
  title: "APIs | Cameleon",
  description:
    "Design REST APIs with resources, operations, parameters, and generated OpenAPI output.",
};

export function meta() {
  return [{ title: metaData.title }, { description: metaData.description }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await listApis(supabase, user?.id);

  if (error) {
    throw new Response(error.message, { status: 500 });
  }

  return {
    apis: data ?? [],
  };
}

function filterApis(apis: ApiRecord[], query: string) {
  if (!query.trim()) return apis;
  const normalized = query.toLowerCase();
  return apis.filter((api) =>
    [api.name, api.description ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export default function ApiStudioLayout() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const showListShell =
    location.pathname === "/app/apis" ||
    location.pathname === "/app/apis/create";
  const loaderData = useLoaderData<typeof loader>();
  const apis = showListShell
    ? [...filterApis(loaderData.apis, query)].sort((a, b) => {
        const sort = searchParams.get("sort") ?? "updatedAt";
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        }
        return (
          Number(new Date(b.updated_at ?? b.created_at ?? 0)) -
          Number(new Date(a.updated_at ?? a.created_at ?? 0))
        );
      })
    : [];
  const hasQuery = Boolean(query);

  return (
    <div className="h-full min-h-0">
      {showListShell ? (
        <div className="m-6 flex flex-col gap-4">
          <div>
            <p className="text-muted-foreground">{metaData.description}</p>
          </div>

          <form className="mb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:w-1/2">
                <SearchField
                  aria-label="Search APIs"
                  placeholder="Search APIs by name or description"
                  className="w-full max-w-96"
                  defaultValue={query}
                  onChange={(value) =>
                    setSearchParams((current) => {
                      const next = new URLSearchParams(current);
                      if (value) next.set("query", value);
                      else next.delete("query");
                      return next;
                    })
                  }
                />
                <Select
                  className="flex-1"
                  defaultSelectedKey={searchParams.get("sort") ?? "updatedAt"}
                  onSelectionChange={(value: string | number | null) =>
                    setSearchParams((current) => {
                      const next = new URLSearchParams(current);
                      if (value) next.set("sort", value.toString());
                      else next.delete("sort");
                      return next;
                    })
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
                <Link
                  href="/app/apis/templates"
                  className={buttonStyles({ intent: "secondary" })}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Templates
                </Link>
                <Link
                  href="/app/apis/create"
                  className={buttonStyles({ intent: "primary" })}
                >
                  <Plus className="h-4 w-4" />
                  New API
                </Link>
              </div>
            </div>
          </form>

          {apis.length ? (
            <section className="space-y-4" aria-label="APIs library">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    APIs
                  </h2>
                </div>
                <Badge intent="secondary">
                  {apis.length} API{apis.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {apis.map((api) => (
                  <RestCard key={api.id} api={api} />
                ))}
              </div>
            </section>
          ) : (
            <div className="rounded-xl border border-border/60 bg-gradient-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                No APIs yet
              </h2>
              <p className="mt-2 text-sm text-muted-fg">
                {hasQuery
                  ? "No APIs matched your current search."
                  : "Start with a blank API or a template and define resources, methods, and response contracts in Rest Studio."}
              </p>
              <div className="mt-4">
                {!hasQuery ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/app/apis/create"
                      className={buttonStyles({
                        intent: "primary",
                        size: "sm",
                      })}
                    >
                      <Plus className="h-4 w-4" />
                      Create your first API
                    </Link>
                    <Link
                      href="/app/apis/templates"
                      className={buttonStyles({
                        intent: "secondary",
                        size: "sm",
                      })}
                    >
                      <LayoutTemplate className="h-4 w-4" />
                      Browse templates
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : null}
      <Outlet />
    </div>
  );
}
