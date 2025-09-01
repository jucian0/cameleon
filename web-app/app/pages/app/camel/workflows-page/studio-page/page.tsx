import { useTopologyStore } from "core";
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
  const { setCamelConfig, setCamelRoute } = useTopologyStore();
  const [query] = useSearchParams();

  React.useEffect(() => {
    setCamelConfig(content);
    const routeId = query.get("route");
    if (routeId) {
      setCamelRoute(routeId);
    }
  }, [content, setCamelConfig]);

  return <TopologyBuilder />;
}
