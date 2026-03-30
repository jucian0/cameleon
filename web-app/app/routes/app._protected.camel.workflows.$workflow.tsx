import {
  INITIAL_STATE,
  jsonToCanvasBuilder,
  useTopologyStore,
  type CamelConfig,
  type Edge,
  type Node,
} from "core";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import {
  isRouteErrorResponse,
  Outlet,
  useRouteError,
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { decode } from "js-base64";
import { jsonToYaml, yamlToJson } from "core";
import React from "react";
import { data as routerData } from "react-router";
import { getWorkflowAccess } from "@/camel/workflows-access";
import { Link } from "app/components/ui/link";
import { buttonStyles } from "app/components/ui/button";

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  return [
    { title: `${loaderData?.name || "Workflow"} | Cameleon` },
    { description: "Create workflows." },
  ];
}

export const handle = {
  breadcrumb: ({ name }: typeof loader) => `Camel Studio - ${name}`,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowsId = params.workflow;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowsId)
    .maybeSingle();
  if (error) {
    throw routerData({ message: error.message }, { status: 500 });
  }
  if (!data) {
    throw routerData({ message: "Workflow not found" }, { status: 404 });
  }

  const decodedData = decode(data.content ?? "");
  const parsedContent = yamlToJson(decodedData);
  const access = getWorkflowAccess({
    currentUserId: user?.id,
    owner: data.owner,
    visibility: data.visibility,
  });

  if (!access.canView) {
    throw routerData(
      { message: "You do not have access to this workflow." },
      { status: 403 },
    );
  }

  return {
    content: parsedContent,
    initialYaml: jsonToYaml(parsedContent as CamelConfig),
    name: data.name,
    workflowId: data.id,
    ...access,
  };
}

export default function CamelStudio({
  loaderData,
}: {
  loaderData: {
    content: unknown;
    initialYaml: string;
    name: string;
    workflowId: string;
    visibility: "public" | "private";
    isOwner: boolean;
    isStarter: boolean;
    canView: boolean;
    canEdit: boolean;
    canDuplicate: boolean;
  };
}) {
  const { content, initialYaml, name, workflowId, ...access } = loaderData;
  const { setCamelConfig, canvas, camelConfig } = useTopologyStore();
  const [query] = useSearchParams();
  const routeId = query.get("route");

  const workflowCanvas = React.useMemo(() => {
    if (routeId) {
      const route = camelConfig?.data.find((r) => r.route?.id === routeId);
      const routeIndex = camelConfig?.data?.findIndex(
        (r) => r.route?.id === routeId,
      );
      return route
        ? jsonToCanvasBuilder(route, routeIndex)
        : { nodes: [], edges: [] };
    }
    const parsedCanvas = { nodes: [] as Node[], edges: [] as Edge[] };
    for (const route of camelConfig?.data ?? INITIAL_STATE.data) {
      if (route.route) {
        const routeIndex = camelConfig?.data?.findIndex(
          (r) => r.route?.id === route.route?.id,
        );
        const { nodes, edges } = jsonToCanvasBuilder(route, routeIndex);
        parsedCanvas.nodes.push(...nodes);
        parsedCanvas.edges.push(...edges);
      }
    }
    return parsedCanvas;
  }, [camelConfig, routeId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: initialized from loader result
  React.useEffect(() => {
    setCamelConfig(content as CamelConfig);
    canvas.setCanvas(workflowCanvas.nodes, workflowCanvas.edges);
  }, [name]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: canvas state follows route and store changes
  React.useEffect(() => {
    canvas.setCanvas(workflowCanvas.nodes, workflowCanvas.edges);
  }, [routeId, camelConfig]);

  return <Outlet context={{ workflowId, initialYaml, ...access }} />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? error.status === 403
      ? "Access denied"
      : error.status === 404
        ? "Workflow not found"
        : "Unable to open workflow"
    : "Unable to open workflow";
  const description = isRouteErrorResponse(error)
    ? error.status === 403
      ? "This workflow is not available to your account."
      : error.status === 404
        ? "The requested workflow does not exist or is no longer available."
        : typeof error.data === "object" &&
            error.data &&
            "message" in error.data
          ? String(error.data.message)
          : "An unexpected error happened while loading the workflow."
    : error instanceof Error
      ? error.message
      : "An unexpected error happened while loading the workflow.";

  return (
    <div className="m-6 rounded-xl border border-border bg-background p-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
      <div className="mt-4">
        <Link
          href="/app/camel/workflows"
          className={buttonStyles({ intent: "secondary", size: "sm" })}
        >
          Back to Workflows
        </Link>
      </div>
    </div>
  );
}
