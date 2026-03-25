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
  Outlet,
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { decode } from "js-base64";
import { yamlToJson } from "core";
import React from "react";

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
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowsId);
  if (error) {
    return { error: error.message };
  }

  const decodedData = decode(data[0].content ?? "");
  return {
    content: yamlToJson(decodedData),
    name: data[0].name,
    visibility: data[0].visibility,
  };
}

export default function CamelStudio({
  loaderData,
}: {
  loaderData: {
    content: unknown;
    name: string;
    visibility: "public" | "private";
  };
}) {
  const { content, name, visibility } = loaderData;
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

  return <Outlet context={{ visibility }} />;
}
