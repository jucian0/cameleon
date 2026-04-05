import { parseApiSpec } from "@/rest-studio/rest-spec";
import { getApiById } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import {
  data as routerData,
  isRouteErrorResponse,
  Outlet,
  useRouteError,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { serializeApiSpec } from "@/rest-studio/rest-spec";

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  return [
    { title: `${loaderData?.name || "API"} | Cameleon` },
    { description: "Design REST resources and inspect generated OpenAPI." },
  ];
}

export const handle = {
  breadcrumb: (data?: { name?: string }) =>
    data?.name ? `Rest Studio - ${data.name}` : "Rest Studio",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const result = await getApiById(supabase, params.api ?? "");

  if (result.error) {
    throw routerData({ message: result.error.message }, { status: 500 });
  }

  if (!result.data) {
    throw routerData({ message: "API not found." }, { status: 404 });
  }

  if (!user?.id || result.data.owner !== user.id) {
    throw routerData(
      { message: "This API is not available to your account." },
      { status: 403 },
    );
  }

  try {
    const spec = parseApiSpec(result.data.content);
    return {
      apiId: result.data.id,
      name: result.data.name,
      description: result.data.description ?? "",
      spec,
      initialSnapshot: JSON.stringify({
        name: result.data.name,
        description: result.data.description ?? "",
        spec,
      }),
      canEdit: true,
    };
  } catch (error) {
    throw routerData(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to parse stored API content.",
      },
      { status: 500 },
    );
  }
}

export default function ApiLayout({
  loaderData,
}: {
  loaderData: {
    apiId: string;
    name: string;
    description: string;
    spec: ReturnType<typeof parseApiSpec>;
    initialSnapshot: string;
    canEdit: boolean;
  };
}) {
  return (
    <div className="h-full min-h-0">
      <Outlet context={loaderData} />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? error.status === 403
      ? "Access denied"
      : error.status === 404
        ? "API not found"
        : "Unable to open API"
    : "Unable to open API";
  const description = isRouteErrorResponse(error)
    ? typeof error.data === "object" && error.data && "message" in error.data
      ? String(error.data.message)
      : "An unexpected error happened while loading the API."
    : error instanceof Error
      ? error.message
      : "An unexpected error happened while loading the API.";

  return (
    <div className="m-6 rounded-xl border border-border bg-background p-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
      <div className="mt-4">
        <Link
          href="/app/apis"
          className={buttonStyles({ intent: "secondary", size: "sm" })}
        >
          Back to APIs
        </Link>
      </div>
    </div>
  );
}
