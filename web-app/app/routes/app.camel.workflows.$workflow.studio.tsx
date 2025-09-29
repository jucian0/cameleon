
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import {
  Outlet,
  type LoaderFunctionArgs,
} from "react-router";
import { encode } from "js-base64";

import { TopologyBuilder } from "@/camel/studio-components/topology-builder/topology-builder";
import type { Route } from "./+types/app.camel.workflows.$workflow.studio";



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

  return (
    <>
      <TopologyBuilder />
      <Outlet />
    </>
  );
}
