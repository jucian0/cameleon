import { RestCard } from "@/rest-studio/rest-card";
import { listApis } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { ApiRecord } from "@/modules/supabase/supabase-db";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import { SearchField } from "app/components/ui/search-field";
import { Eye, LayoutTemplate, Plus } from "lucide-react";
import { useSearchParams, type LoaderFunctionArgs } from "react-router";

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

export default function ApiIndex({
  loaderData,
}: {
  loaderData: { apis: ApiRecord[] };
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const apis = filterApis(loaderData.apis, query);

  return (
    <div className="m-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground">{metaData.description}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {apis.length} API{apis.length === 1 ? "" : "s"} in your workspace
          </p>
        </div>
        <Link
          href="/app/apis/create"
          className={buttonStyles({ intent: "primary" })}
        >
          <Plus className="h-4 w-4" />
          New API
        </Link>
        <Link
          href="/app/apis/templates"
          className={buttonStyles({ intent: "secondary" })}
        >
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Link>
        <Link
          href="/app/apis/preview"
          className={buttonStyles({ intent: "secondary" })}
        >
          <Eye className="h-4 w-4" />
          Studio preview
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <SearchField
          aria-label="Search APIs"
          placeholder="Search APIs"
          className="w-full max-w-96"
          defaultValue={query}
          onChange={(value) => setSearchParams(value ? { query: value } : {})}
        />
        <Badge intent="secondary">{apis.length}</Badge>
      </div>

      {apis.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apis.map((api) => (
            <RestCard key={api.id} api={api} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-gradient-card p-6">
          <h2 className="text-lg font-semibold text-foreground">No APIs yet</h2>
          <p className="mt-2 text-sm text-muted-fg">
            Start with a blank API and define resources, methods, and response
            contracts in Rest Studio.
          </p>
          <div className="mt-4">
            <Link
              href="/app/apis/create"
              className={buttonStyles({ intent: "primary", size: "sm" })}
            >
              <Plus className="h-4 w-4" />
              Create your first API
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
