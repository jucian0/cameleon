import { jsonToTopologyBuilder, useTopologyStore } from "core";
import { TopologyBuilder } from "../../topology-lib/topology-builder/topology-builder";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import {
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import type { Route } from "../studio-page/+types/page";
import { decode, encode } from "js-base64";
import { yamlToJson } from "core";
import React from "react";

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  return [
    { title: `${loaderData?.name || "Workflow"} | Cameleon` },
    { description: "Create workflows." },
  ];
}

export const handle = {
  breadcrumb: () => "Camel Studio",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowsId = params.workflowsId;
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowsId);
  if (error) {
    return { error: error.message };
  }

  const decodedData = decode(data[0].content ?? "");
  return { content: yamlToJson(decodedData), name: data[0].name };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowsId = params.workflowsId;
  const formData = await request.formData();
  const content = formData.get("content") ?? "";
  await supabase
    .from("workflows")
    .update({
      content: encode(content as string),
    })
    .eq("id", workflowsId);
}

export default function CamelStudio({ loaderData }: Route.ComponentProps) {
  const { content } = loaderData;
  const { setCamelConfig, canvas, camelConfig } = useTopologyStore();
  const [query] = useSearchParams();
  const routeId = query.get("route");

  const workflowCanvas = React.useMemo(() => {
    if (routeId) {
      const route = camelConfig.data.find((r) => r.route?.id === routeId);

      return route ? jsonToTopologyBuilder(route) : { nodes: [], edges: [] };
    } else {
      const parsedCanvas = { nodes: [], edges: [] } as any;
      for (const route of camelConfig.data) {
        if (route.route) {
          const { nodes, edges } = jsonToTopologyBuilder(route);
          parsedCanvas.nodes.push(...nodes);
          parsedCanvas.edges.push(...edges);
        }
      }
      return parsedCanvas;
    }
  }, [camelConfig, routeId]);

  React.useEffect(() => {
    setCamelConfig(content);
    canvas.setCanvas(workflowCanvas.nodes, workflowCanvas.edges);
  }, [content, setCamelConfig]);

  React.useEffect(() => {
    canvas.setCanvas(workflowCanvas.nodes, workflowCanvas.edges);
  }, [routeId, camelConfig]);

  return <TopologyBuilder />;
}
