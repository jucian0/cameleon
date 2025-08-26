import { useTopologyStore } from "core";
import { TopologyBuilder } from "../../topology-lib/topology-builder/topology-builder";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "../studio-page/+types/page";
import { decode, encode } from "js-base64";
import { yamlToJson } from "core";
import React from "react";

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
  return { content: yamlToJson(decodedData) };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowsId = params.workflowsId;
  const formData = await request.formData();
  const content = formData.get("content") ?? "";
  const { data, error } = await supabase
    .from("workflows")
    .update({
      content: encode(content as string),
    })
    .eq("id", workflowsId);
}

export default function CamelStudio({ loaderData }: Route.ComponentProps) {
  const { content } = loaderData;
  const { setCamelConfig } = useTopologyStore();

  React.useEffect(() => {
    setCamelConfig(content);
  }, [content, setCamelConfig]);

  return <TopologyBuilder />;
}
